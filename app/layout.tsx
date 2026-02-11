import type { Metadata } from "next";
import "./globals.css";
import { SettingsProvider } from "@/context/SettingsContext";
import { Header } from "@/components/Header";

export const metadata: Metadata = {
  title: "LocalLingo",
  description: "Privacy-focused translation powered by local Ollama models",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SettingsProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 flex flex-col">{children}</main>
          </div>
        </SettingsProvider>
      </body>
    </html>
  );
}
