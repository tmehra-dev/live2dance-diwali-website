import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { bakedContent } from '../content/defaults'
import { Page } from './Page'

export function render() {
  return renderToString(
    <StrictMode>
      <Page content={bakedContent} />
    </StrictMode>,
  )
}
