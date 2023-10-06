import { type Resource, Resources } from '@/components/Resources'

const resources: Resource[] = [
  {
    title: 'Docs',
    href: 'https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app',
    description: 'Find in-depth information about Next.js features and API.',
  },
  {
    title: 'Learn',
    href: 'https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app',
    description: 'Learn about Next.js in an interactive course with quizzes!',
  },
  {
    title: 'Templates',
    href: 'https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app',
    description: 'Explore the Next.js 13 playground.',
  },
  {
    title: 'Deploy',
    href: 'https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app',
    description:
      'Instantly deploy your Next.js site to a shareable URL with Vercel.',
  },
]

export default function Home() {
  return (
    <main>

      <div>
        <h1>Next.js</h1>
      </div>

      <Resources resources={resources} />
    </main>
  )
}
