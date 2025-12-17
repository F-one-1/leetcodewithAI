import { MetadataRoute } from 'next';
import { getProblemList } from '@/lib/problems';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.leetcodewithai.xyz';
  const problems = await getProblemList();

  // 首页
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
  ];

  // 每个问题页面
  const problemRoutes: MetadataRoute.Sitemap = problems.map((problem) => ({
    url: `${baseUrl}/problems/${problem.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...routes, ...problemRoutes];
}

