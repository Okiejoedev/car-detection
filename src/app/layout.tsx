import './globals.css'

export const metadata = {
  title: 'Car Overspeeding Detection',
  description: 'AI-powered traffic monitoring system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
