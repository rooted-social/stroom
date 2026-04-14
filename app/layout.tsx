import type { Metadata } from "next";
import { Noto_Sans_KR, Space_Grotesk } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { GaPageTracker } from "@/components/analytics/ga-page-tracker";
import { getGaMeasurementId } from "@/lib/analytics/gtag";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  variable: "--font-main",
  weight: ["400", "500", "700"],
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700"],
});

export const metadata: Metadata = {
  title: "스트룸 - 매매일지 및 트레이딩 관리 시스템",
  description: "Trading journal workspace for disciplined traders.",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const gaMeasurementId = getGaMeasurementId();

  return (
    <html
      lang="ko"
      className={`dark h-full antialiased ${notoSansKr.variable} ${spaceGrotesk.variable}`}
    >
      <body className="min-h-full flex flex-col">
        {gaMeasurementId ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}', { send_page_view: false });
              `}
            </Script>
          </>
        ) : null}
        <GaPageTracker />
        {children}
      </body>
    </html>
  );
}
