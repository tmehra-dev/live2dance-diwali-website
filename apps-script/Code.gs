/**
 * Live2Dance Waali Diwali: content backend.
 *
 * Bound to the "Website Content" Google Sheet and deployed as a web app (Execute as: Me,
 * Who has access: Anyone). In the Sheet, use the "Website admin" menu to set the admin
 * password. See README.md for the full walkthrough.
 */

var TABLES = {
  Sections: ['id', 'label', 'visible'],
  Vendors: ['id', 'name', 'category', 'description', 'website', 'instagram', 'logo', 'featured', 'visible'],
  Performances: ['id', 'title', 'performer', 'type', 'start', 'end', 'stage', 'description', 'image', 'link', 'visible'],
  Activities: ['id', 'title', 'description', 'icon', 'visible'],
  FAQ: ['id', 'question', 'answer', 'visible'],
};
var CONTENT_KEYS = { Sections: 'sections', Vendors: 'vendors', Performances: 'performances', Activities: 'activities', FAQ: 'faqs' };
var CACHE_KEY = 'public-content-v1';
var CACHE_SECONDS = 60;
var HISTORY_SHEET = '_History';
var HISTORY_KEEP = 200;

// ---------- Web app entry points ----------

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'content';
  try {
    if (action === 'content') return json(publicContent());
    return json({ error: 'Unknown action' });
  } catch (err) {
    return json({ error: String(err) });
  }
}

/** Admin calls are POSTed as text/plain JSON ({ token, action, payload }) to avoid CORS preflight. */
function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var payload = body.payload || {};
    if (body.action === 'login') return json(login(payload.password, payload.name));
    var user = verifySession(body.token);
    switch (body.action) {
      case 'whoami':
        return json({ name: user });
      case 'logout':
        CacheService.getScriptCache().remove('session:' + body.token);
        return json({ ok: true });
      case 'changePassword':
        if (!checkPassword(payload.current)) throw new Error('Your current password is not right.');
        storePassword(payload.next);
        return json({ ok: true });
      case 'getAll':
        return json(readAll(false));
      case 'saveSettings':
        writeSettings(payload.settings, user);
        break;
      case 'saveTable':
        writeTable(payload.tab, payload.rows, user);
        break;
      case 'uploadImage':
        return json({ url: saveImage(payload) });
      case 'history':
        return json({ entries: listHistory(payload.tab) });
      case 'restore':
        restoreHistory(payload.row, user);
        break;
      case 'readSheet':
        return json(readExternalSheet(payload.url));
      default:
        return json({ error: 'Unknown action' });
    }
    CacheService.getScriptCache().remove(CACHE_KEY);
    return json({ ok: true, updatedAt: touch() });
  } catch (err) {
    return json({ error: String(err && err.message ? err.message : err) });
  }
}

function json(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

// ---------- Auth ----------

var SESSION_SECONDS = 6 * 60 * 60;
var MAX_FAILED_LOGINS = 8;
var LOCKOUT_SECONDS = 15 * 60;

function hashPassword(password, salt) {
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, salt + ':' + password, Utilities.Charset.UTF_8);
  return Utilities.base64Encode(bytes);
}

function storePassword(password) {
  if (!password || String(password).length < 8) throw new Error('Please use a password of at least 8 characters.');
  var salt = Utilities.getUuid();
  PropertiesService.getScriptProperties().setProperties({ ADMIN_SALT: salt, ADMIN_HASH: hashPassword(String(password), salt) });
}

function checkPassword(password) {
  var props = PropertiesService.getScriptProperties();
  var salt = props.getProperty('ADMIN_SALT');
  var hash = props.getProperty('ADMIN_HASH');
  if (!salt || !hash || !password) return false;
  var given = hashPassword(String(password), salt);
  // Compare every character so timing doesn't reveal how much matched.
  var diff = given.length ^ hash.length;
  for (var i = 0; i < Math.min(given.length, hash.length); i++) diff |= given.charCodeAt(i) ^ hash.charCodeAt(i);
  return diff === 0;
}

function login(password, name) {
  var cache = CacheService.getScriptCache();
  if (!PropertiesService.getScriptProperties().getProperty('ADMIN_HASH')) {
    throw new Error('No admin password has been set yet. In the content Sheet, use the "Website admin" menu to set one.');
  }
  var fails = Number(cache.get('login-fails') || 0);
  if (fails >= MAX_FAILED_LOGINS) throw new Error('Too many wrong passwords. Please wait 15 minutes and try again.');
  if (!checkPassword(password)) {
    cache.put('login-fails', String(fails + 1), LOCKOUT_SECONDS);
    Utilities.sleep(1000);
    throw new Error('That password is not right.');
  }
  var who = String(name || 'Admin').trim().slice(0, 40) || 'Admin';
  var token = Utilities.getUuid() + Utilities.getUuid();
  cache.put('session:' + token, who, SESSION_SECONDS);
  return { token: token, name: who, expiresIn: SESSION_SECONDS };
}

function verifySession(token) {
  if (!token) throw new Error('Please sign in.');
  var cache = CacheService.getScriptCache();
  var who = cache.get('session:' + token);
  if (!who) throw new Error('Your session has expired. Please sign in again.');
  cache.put('session:' + token, who, SESSION_SECONDS);
  return who;
}

// ---------- Sheet menu (password setup) ----------

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Website admin')
    .addItem('Set admin password', 'promptForPassword')
    .addItem('Set image upload token', 'promptForGithubToken')
    .addItem('Prepare this Sheet (first time only)', 'setup')
    .addToUi();
}

function promptForPassword() {
  var ui = SpreadsheetApp.getUi();
  var res = ui.prompt('Admin password', 'Choose the password for the website admin page (at least 8 characters). Everyone signed in now stays signed in until their session ends.', ui.ButtonSet.OK_CANCEL);
  if (res.getSelectedButton() !== ui.Button.OK) return;
  try {
    storePassword(res.getResponseText());
    setup();
    ui.alert('Saved! Use this password on the website admin page.');
  } catch (err) {
    ui.alert(String(err.message || err));
  }
}

// ---------- Reading ----------

function ss() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function publicContent() {
  var cache = CacheService.getScriptCache();
  var hit = cache.get(CACHE_KEY);
  if (hit) return JSON.parse(hit);
  var content = readAll(true);
  var text = JSON.stringify(content);
  if (text.length < 95000) cache.put(CACHE_KEY, text, CACHE_SECONDS);
  return content;
}

function readAll(publicOnly) {
  var content = { settings: readSettings(), updatedAt: PropertiesService.getScriptProperties().getProperty('UPDATED_AT') || '' };
  Object.keys(TABLES).forEach(function (tab) {
    var rows = readTable(tab);
    if (rows === null) return;
    // Sections keep hidden rows so the site knows the intended order.
    if (publicOnly && tab !== 'Sections') rows = rows.filter(function (r) { return isTrue(r.visible); });
    content[CONTENT_KEYS[tab]] = rows;
  });
  return content;
}

function isTrue(v) {
  return /^(true|yes|y|1|x)$/i.test(String(v).trim());
}

function readSettings() {
  var sheet = ss().getSheetByName('Settings');
  var out = {};
  if (!sheet || sheet.getLastRow() < 2) return out;
  sheet
    .getRange(2, 1, sheet.getLastRow() - 1, 2)
    .getDisplayValues()
    .forEach(function (r) {
      var key = String(r[0]).trim();
      if (key) out[key] = r[1];
    });
  return out;
}

/** Returns null for a missing tab so the website falls back to its built-in content. */
function readTable(tab) {
  var sheet = ss().getSheetByName(tab);
  if (!sheet) return null;
  var values = sheet.getDataRange().getDisplayValues();
  if (values.length < 1) return [];
  var header = values[0].map(function (h) { return String(h).trim(); });
  return values
    .slice(1)
    .filter(function (r) { return r.some(function (c) { return String(c).trim() !== ''; }); })
    .map(function (r) {
      var obj = {};
      header.forEach(function (h, i) { if (h) obj[h] = r[i]; });
      return obj;
    });
}

// ---------- Writing ----------

function touch() {
  var now = new Date().toISOString();
  PropertiesService.getScriptProperties().setProperty('UPDATED_AT', now);
  return now;
}

function writeSettings(settings, user) {
  if (!settings || typeof settings !== 'object') throw new Error('No settings supplied.');
  var sheet = ss().getSheetByName('Settings') || ss().insertSheet('Settings');
  backup('Settings', user);
  var existing = sheet.getLastRow() >= 2 ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 3).getDisplayValues() : [];
  var notes = {};
  existing.forEach(function (r) { notes[r[0]] = r[2]; });
  var rows = Object.keys(settings).map(function (k) { return [k, settings[k] === null || settings[k] === undefined ? '' : String(settings[k]), notes[k] || '']; });
  sheet.clearContents();
  sheet.getRange(1, 1, 1, 3).setValues([['key', 'value', 'notes']]).setFontWeight('bold');
  if (rows.length) sheet.getRange(2, 1, rows.length, 3).setNumberFormat('@').setValues(rows);
}

function writeTable(tab, rows, user) {
  var header = TABLES[tab];
  if (!header) throw new Error('Unknown table ' + tab);
  if (!Array.isArray(rows)) throw new Error('Rows must be a list.');
  var sheet = ss().getSheetByName(tab) || ss().insertSheet(tab);
  backup(tab, user);
  var values = rows.map(function (r) {
    return header.map(function (h) {
      var v = r[h];
      if (v === undefined || v === null) return '';
      if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
      return String(v);
    });
  });
  sheet.clearContents();
  sheet.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight('bold');
  if (values.length) sheet.getRange(2, 1, values.length, header.length).setNumberFormat('@').setValues(values);
  sheet.setFrozenRows(1);
}

// ---------- History / rollback ----------

function historySheet() {
  var sheet = ss().getSheetByName(HISTORY_SHEET);
  if (!sheet) {
    sheet = ss().insertSheet(HISTORY_SHEET);
    sheet.getRange(1, 1, 1, 4).setValues([['savedAt', 'user', 'tab', 'snapshot']]).setFontWeight('bold');
    sheet.hideSheet();
  }
  return sheet;
}

function backup(tab, user) {
  var sheet = ss().getSheetByName(tab);
  if (!sheet || sheet.getLastRow() < 1) return;
  var snapshot = JSON.stringify(sheet.getDataRange().getDisplayValues());
  if (snapshot.length > 49000) snapshot = JSON.stringify({ tooLarge: true });
  var h = historySheet();
  h.appendRow([new Date().toISOString(), user, tab, snapshot]);
  var extra = h.getLastRow() - 1 - HISTORY_KEEP;
  if (extra > 0) h.deleteRows(2, extra);
}

function listHistory(tab) {
  var h = historySheet();
  if (h.getLastRow() < 2) return [];
  return h
    .getRange(2, 1, h.getLastRow() - 1, 3)
    .getDisplayValues()
    .map(function (r, i) { return { row: i + 2, savedAt: r[0], user: r[1], tab: r[2] }; })
    .filter(function (e) { return !tab || e.tab === tab; })
    .reverse()
    .slice(0, 30);
}

function restoreHistory(row, user) {
  var h = historySheet();
  var r = h.getRange(Number(row), 1, 1, 4).getDisplayValues()[0];
  var tab = r[2];
  var values = JSON.parse(r[3]);
  if (!Array.isArray(values)) throw new Error('That backup was too large to keep.');
  var sheet = ss().getSheetByName(tab) || ss().insertSheet(tab);
  backup(tab, user);
  sheet.clearContents();
  if (values.length) sheet.getRange(1, 1, values.length, values[0].length).setNumberFormat('@').setValues(values);
}

// ---------- Importing from another Sheet ----------

/** Mirrors PRIVATE_COLUMN in src/lib/importers.ts: these columns never leave the registration sheet. */
var PRIVATE_COLUMN = /phone|e-?mail|contact person|permit|electric|licen[cs]e|upload|document|timestamp|sponsor|anything else|questions?|business type|menu and doc|address of|tax id|ein\b/i;

/** Reads a sheet the script owner can open (e.g. the vendor registration responses) for the admin importer. */
function readExternalSheet(url) {
  if (!/docs\.google\.com\/spreadsheets\/d\//.test(String(url))) throw new Error('Paste a Google Sheets link.');
  var book = SpreadsheetApp.openByUrl(url);
  var gid = (String(url).match(/[#&?]gid=(\d+)/) || [])[1];
  var sheet = gid
    ? book.getSheets().filter(function (s) { return String(s.getSheetId()) === gid; })[0]
    : book.getSheets()[0];
  if (!sheet) throw new Error('Could not find that tab in the spreadsheet.');
  var values = sheet.getDataRange().getDisplayValues();
  var header = (values[0] || []).map(function (h) { return String(h).trim(); });
  var keep = [];
  var dropped = [];
  header.forEach(function (h, i) {
    if (!h) return;
    // "Paid" carries the confirmed flag the importer needs, so it is allowed through.
    if (PRIVATE_COLUMN.test(h)) dropped.push(h);
    else keep.push(i);
  });
  var rows = values.slice(1).map(function (r) {
    var obj = {};
    keep.forEach(function (i) { obj[header[i]] = r[i]; });
    return obj;
  });
  return { headers: keep.map(function (i) { return header[i]; }), rows: rows, dropped: dropped };
}

// ---------- Images ----------
// Browsers refuse to show Google Drive files in <img> tags, so uploads are committed to a
// dedicated branch of the website's GitHub repo and served from the jsDelivr CDN, pinned to
// the commit so the link never changes.

var DEFAULT_REPO = 'tmehra-dev/live2dance-diwali-website';
var DEFAULT_BRANCH = 'media-uploads';

function github(path, method, body) {
  var token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if (!token) throw new Error('Image uploads are not set up yet. In the content Sheet, use "Website admin → Set image upload token".');
  var res = UrlFetchApp.fetch('https://api.github.com' + path, {
    method: method || 'get',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + token, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
    payload: body ? JSON.stringify(body) : undefined,
    muteHttpExceptions: true,
  });
  var code = res.getResponseCode();
  var data = res.getContentText() ? JSON.parse(res.getContentText()) : {};
  if (code >= 300) throw new Error('GitHub said ' + code + ': ' + (data.message || 'request failed'));
  return data;
}

function slugifyName(name) {
  return String(name || 'image').toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'image';
}

function saveImage(payload) {
  var types = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif' };
  var ext = types[payload.mimeType];
  if (!ext) throw new Error('Please upload a PNG, JPG, WebP or GIF image.');
  if (!payload.dataBase64 || payload.dataBase64.length > 7 * 1024 * 1024) throw new Error('Images must be under 5 MB.');
  var props = PropertiesService.getScriptProperties();
  var repo = props.getProperty('GITHUB_REPO') || DEFAULT_REPO;
  var branch = props.getProperty('GITHUB_BRANCH') || DEFAULT_BRANCH;
  var stamp = Utilities.formatDate(new Date(), 'America/Los_Angeles', 'yyyyMMdd-HHmmss');
  var path = 'uploads/' + stamp + '-' + Utilities.getUuid().slice(0, 6) + '-' + slugifyName(payload.name) + '.' + ext;
  var result = github('/repos/' + repo + '/contents/' + path, 'put', {
    message: 'Upload ' + path + ' from website admin',
    content: payload.dataBase64,
    branch: branch,
  });
  return 'https://cdn.jsdelivr.net/gh/' + repo + '@' + result.commit.sha + '/' + path;
}

function promptForGithubToken() {
  var ui = SpreadsheetApp.getUi();
  var res = ui.prompt(
    'Image upload token',
    'Paste the GitHub fine-grained token that can write to ' + DEFAULT_REPO + ' (Contents: Read and write). It is stored privately in this script.',
    ui.ButtonSet.OK_CANCEL,
  );
  if (res.getSelectedButton() !== ui.Button.OK) return;
  var token = res.getResponseText().trim();
  PropertiesService.getScriptProperties().setProperty('GITHUB_TOKEN', token);
  try {
    var repo = github('/repos/' + DEFAULT_REPO);
    ui.alert('Saved! Image uploads will go to ' + repo.full_name + ' (branch ' + DEFAULT_BRANCH + ').');
  } catch (err) {
    ui.alert('Saved, but the token did not work: ' + err.message);
  }
}

// ---------- One-time setup ----------

/** Creates the content tabs and the hidden history tab. Safe to run again. */
function setup() {
  var book = ss();
  if (!book.getSheetByName('Settings')) {
    book.insertSheet('Settings').getRange(1, 1, 1, 3).setValues([['key', 'value', 'notes']]).setFontWeight('bold');
  }
  Object.keys(TABLES).forEach(function (tab) {
    if (!book.getSheetByName(tab)) {
      var sheet = book.insertSheet(tab);
      sheet.getRange(1, 1, 1, TABLES[tab].length).setValues([TABLES[tab]]).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  });
  historySheet();
  var blank = book.getSheetByName('Sheet1');
  if (blank && book.getSheets().length > 1 && blank.getLastRow() === 0) book.deleteSheet(blank);
}
