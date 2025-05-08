import { Inter } from "next/font/google"
import "./globals.css"
import { Navbar } from "@/components/navbar"
import { AuthProvider } from "@/components/auth-provider"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "FitFaat - Your Fitness Companion",
  description: "Track your fitness journey with FitFaat",
    
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <div className="flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">{children}</main>
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
