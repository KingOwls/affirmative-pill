import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { Providers } from "./providers";
import { CartBadge } from "@/src/ui/CartBadge";

export const metadata: Metadata = {
  title: "Afirmative Pill",
  description: "GraphQL + CQRS pharmaceutical e-commerce workshop",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <Providers>
          <header className="header">
            <div className="header-inner">
              <Link href="/" className="brand">Afirmative <span>Pill</span></Link>
              <nav className="nav">
                <Link href="/catalog">Catálogo</Link>
                <CartBadge />
              </nav>
            </div>
          </header>
          <main className="shell">{children}</main>
          <div className="shell"><footer className="footer">Taller académico: GraphQL, CQRS, Apollo, DataLoader y PostgreSQL.</footer></div>
        </Providers>
      </body>
    </html>
  );
}
