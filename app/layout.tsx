import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Bricolage_Grotesque, Italiana, Bodoni_Moda } from "next/font/google";
import "./globals.css";
import { ClientProviders } from "@/components/ClientProviders";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const bricolageGrotesque = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
});

const italiana = Italiana({
  variable: "--font-brand-mystique",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const bodoniModa = Bodoni_Moda({
  variable: "--font-brand-legacy",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FITMEZ — AI Stylist & Digital Wardrobe",
  description: "Your wardrobe, styled by MIW AI. Intelligent outfit recommendations and digital styling.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#161811",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakartaSans.variable} ${bricolageGrotesque.variable} ${italiana.variable} ${bodoniModa.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                var stored = localStorage.getItem('fitmez_theme') || localStorage.getItem('dripcheck_theme');
                var isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches) || (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
                document.documentElement.classList.toggle('dark', isDark);
                document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';

                var storedFont = localStorage.getItem('fitmez_brand_font');
                document.documentElement.setAttribute('data-brand-font', storedFont === 'legacy' ? 'legacy' : 'mystique');
              } catch(e) {}
            })();`,
          }}
        />
        <meta name="theme-color" content="#161811" />
      </head>
      <body className="min-h-[100dvh] bg-[#0D1009] text-[var(--text)] flex justify-center items-stretch antialiased selection:bg-[var(--accent-tint)] selection:text-[var(--accent)] overflow-x-hidden">
        {/* Centered phone-width container on wide screens */}
        <div className="w-full max-w-[430px] min-h-[100dvh] h-[100dvh] bg-[var(--bg)] shadow-[0_0_60px_rgba(22,24,17,0.9)] flex flex-col relative overflow-hidden">
          <ClientProviders>
            {children}
          </ClientProviders>
        </div>
      </body>
    </html>
  );
}
