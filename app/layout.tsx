import React, {Suspense} from "react"
import type {Metadata} from "next"
import {Inter} from "next/font/google"
import {GoogleAnalytics} from "@/components/google-analytics"
import "./globals.css"
import {Navbar} from "@/components/navbar"
import {ThemeProvider} from "@/components/theme-provider"
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import './globals.css'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Votaciones de Diputados de Argentina",
  description: "Descubre cómo votan los diputados de la Cámara de Diputados de la Nación Argentina.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Suspense>
          <NuqsAdapter>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
              <div className="flex min-h-screen flex-col">
                <GoogleAnalytics />
                <Navbar />
                <main className="flex-1">{children}</main>
                <footer className="border-t py-6">
                  <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
                    <p className="text-center text-sm text-muted-foreground md:text-left">
                      Hecho en comunidad gracias a la información pública de {' '}
                      <a href="https://www.diputados.gob.ar/"
                         target="_blank"
                         rel="noopener noreferrer"
                         aria-label="Sitio web de la Cámara de Diputados de Argentina"
                         className="text-primary">diputados.gob.ar</a>
                      {' '} procesada y mantenida por {' '}
                      <a href="https://argentinadatos.com/"
                         target="_blank"
                         rel="noopener noreferrer"
                         aria-label="Sitio web de Argentina Datos"
                         className="text-primary">argentinadatos.com</a>.
                    </p>

                    <a href="https://github.com/enzonotario/diputados"
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <span>Reportar errores y colaborar</span>
                      <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-5 w-5"
                      >
                        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
                      </svg>
                    </a>
                  </div>
                </footer>
              </div>
            </ThemeProvider>
          </NuqsAdapter>
        </Suspense>
      </body>
    </html>
  )
}

