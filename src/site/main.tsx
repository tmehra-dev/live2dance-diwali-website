import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import '../styles.css'
import { useSiteContent } from '../lib/content'
import { Page } from './Page'

function Site() {
  const { content } = useSiteContent()
  return <Page content={content} />
}

const root = document.getElementById('root')!
const app = (
  <StrictMode>
    <Site />
  </StrictMode>
)

if (root.firstElementChild) hydrateRoot(root, app)
else createRoot(root).render(app)
