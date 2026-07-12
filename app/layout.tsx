import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: { default: "Pulse", template: "%s · Pulse" },
  description:
    "Attendance, academic calendar and money — everything a college student needs, in one place.",
  manifest: "/manifest.json",
  applicationName: "Pulse",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pulse",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0D0D14",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

// Applies the saved theme before first paint — no flash on load.
const themeBootScript = `(function(){try{var t="dark";var raw=localStorage.getItem("pulse-settings");if(raw){var s=JSON.parse(raw);if(s&&s.state&&s.state.theme)t=s.state.theme}else if(window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches){t="light"}document.documentElement.classList.remove("dark","light","amoled");document.documentElement.classList.add(t)}catch(e){document.documentElement.classList.add("dark")}})();`;

// Every page fetches from Supabase almost immediately on mount — warming
// the connection (DNS + TLS) before that request fires shaves the
// round-trip off the very first query.
const supabaseOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin;
  } catch {
    return null;
  }
})();

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`dark ${inter.variable}`} suppressHydrationWarning>
      <head>
        {supabaseOrigin && (
          <>
            <link rel="preconnect" href={supabaseOrigin} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={supabaseOrigin} />
          </>
        )}
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="font-sans min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
