import "../styles/globals.css"              // or your fixed alias
import type { Metadata } from "next"
import { getBaseURL } from "@lib/util/env"  // if this alias is valid
import Providers from "./providers"
import Footer from "@modules/layout/templates/footer"


export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light">
      <body>
        <Providers>
          <main className="relative">{children}</main>
        </Providers>
        <Footer />
      </body>
    </html>
  )
}
