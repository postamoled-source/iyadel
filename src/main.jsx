import React from 'react'
import ReactDOM from 'react-dom/client'
import { ThemeProvider } from 'next-themes'
import { I18nProvider } from '@/lib/i18n'
import App from '@/App.jsx'
import '@/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
    <I18nProvider>
      <App />
    </I18nProvider>
  </ThemeProvider>
)