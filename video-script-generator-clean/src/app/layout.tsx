import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Video Script Generator',
  description: 'Gerador inteligente de roteiros de vídeo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}
