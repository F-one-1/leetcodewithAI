import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap', // 优化字体加载
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.leetcodewithai.xyz'),
  title: {
    default: 'LeetCode with AI - AI 驱动的算法练习平台',
    template: '%s | LeetCode with AI',
  },
  description: '集成了 AI 助手的 LeetCode 练习平台，提供代码编辑、测试用例管理、代码执行和 AI 代码分析功能。',
  keywords: ['LeetCode', '算法', '编程练习', 'AI 助手', '代码编辑器', '算法题'],
  authors: [{ name: 'LeetCode with AI' }],
  creator: 'LeetCode with AI',
  publisher: 'LeetCode with AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://www.leetcodewithai.xyz',
    siteName: 'LeetCode with AI',
    title: 'LeetCode with AI - AI 驱动的算法练习平台',
    description: '集成了 AI 助手的 LeetCode 练习平台',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'LeetCode with AI',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LeetCode with AI',
    description: 'AI 驱动的算法练习平台',
    images: ['/logo.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        {/* 预连接外部资源 */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
