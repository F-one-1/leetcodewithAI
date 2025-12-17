import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProblemData, getProblemList } from '@/lib/problems';
import { ProblemPageClient } from '@/components/ProblemPageClient';

// ISR 配置：每 1 小时重新生成
export const revalidate = 3600;

// 生成静态参数（构建时预生成所有问题页面）
export async function generateStaticParams() {
  const problems = await getProblemList();
  return problems.map((problem) => ({
    id: problem.id,
  }));
}

// 动态生成 metadata（SEO 核心）
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const { id } = await params;
  const problemData = await getProblemData(id);
  
  if (!problemData) {
    return {
      title: '问题未找到',
    };
  }

  // 提取问题描述的前 160 个字符作为 description
  const description = problemData.content
    .replace(/<[^>]*>/g, '') // 移除 HTML 标签
    .substring(0, 160)
    .trim() + '...';

  const title = `${problemData.title} - LeetCode with AI`;
  const url = `https://www.leetcodewithai.xyz/problems/${id}`;

  return {
    title,
    description,
    keywords: [
      problemData.title,
      problemData.difficulty,
      'LeetCode',
      '算法',
      '编程练习',
      'JavaScript',
      'TypeScript',
    ],
    openGraph: {
      title,
      description,
      type: 'article',
      url,
      siteName: 'LeetCode with AI',
      images: [
        {
          url: '/logo.png',
          width: 1200,
          height: 630,
          alt: problemData.title,
        },
      ],
      publishedTime: new Date().toISOString(),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['/logo.png'],
    },
    alternates: {
      canonical: url,
    },
  };
}

export default async function ProblemPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  const problemData = await getProblemData(id);

  if (!problemData) {
    notFound();
  }

  return (
    <>
      {/* JSON-LD 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: problemData.title,
            description: problemData.content
              .replace(/<[^>]*>/g, '')
              .substring(0, 200),
            author: {
              '@type': 'Organization',
              name: 'LeetCode with AI',
            },
            publisher: {
              '@type': 'Organization',
              name: 'LeetCode with AI',
              logo: {
                '@type': 'ImageObject',
                url: 'https://www.leetcodewithai.xyz/logo.png',
              },
            },
            datePublished: new Date().toISOString(),
            dateModified: new Date().toISOString(),
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `https://www.leetcodewithai.xyz/problems/${id}`,
            },
            about: {
              '@type': 'Thing',
              name: `${problemData.difficulty} 难度算法题`,
            },
          }),
        }}
      />
      
      {/* 面包屑导航结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: '首页',
                item: 'https://www.leetcodewithai.xyz',
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: problemData.title,
                item: `https://www.leetcodewithai.xyz/problems/${id}`,
              },
            ],
          }),
        }}
      />
      
      {/* 问题页面内容 */}
      <ProblemPageClient initialData={problemData} />
    </>
  );
}

