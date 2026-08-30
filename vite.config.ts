import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // The PDF-generation chunk (jsPDF, jspdf-autotable, and an embedded
    // TTF font) is lazy-loaded only when a user downloads an invoice, so
    // its size doesn't affect initial page load and isn't worth flagging.
    chunkSizeWarningLimit: 650,
  },
})
