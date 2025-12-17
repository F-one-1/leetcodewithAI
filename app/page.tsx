import { redirect } from 'next/navigation';
import { DEFAULT_PROBLEM_ID } from '@/constants';

export default function Home() {
  // 重定向到默认问题页面
  redirect(`/problems/${DEFAULT_PROBLEM_ID}`);
}
