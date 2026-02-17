import type { Metadata } from 'next'
import './globals.css'
import { getServerSession } from 'next-auth'
import SessionProvider from './SessionProvider'

export const metadata: Metadata = {
  title: 'Video Script Generator',
  description: 'Gerador inteligente de roteiros de vídeo com IA',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession()
  return (
    <html lang="pt-BR">
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
