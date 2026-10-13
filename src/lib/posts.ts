import { getCollection } from 'astro:content';

// 草稿只在 npm run dev 時看得到，正式網站不會出現
export async function getPosts() {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export function formatDate(date: Date) {
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
}

// 文章卡片輪流使用的色塊，需寫成完整字串 Tailwind 才掃描得到
export const shardStyles = ['bg-pink shard-1', 'bg-blue shard-2', 'bg-orange shard-3', 'bg-green shard-4'];
