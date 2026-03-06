import type { Metadata } from 'next'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Blog — Love money, prêt familial & financement entre proches | FamilyFund',
  description:
    'Guides pratiques sur la love money, la fiscalité du prêt familial et les bonnes pratiques pour financer votre projet grâce à vos proches.',
}

const POSTS_QUERY = `
  *[_type == "post"] | order(publishedAt desc) {
    _id, title, slug, excerpt, publishedAt
  }
`

export default async function BlogPage() {
  const posts = await client.fetch<{
    _id: string
    title: string
    slug: { current: string }
    excerpt?: string
    publishedAt?: string
  }[]>(POSTS_QUERY)

  return (
    <main className="min-h-screen bg-[#0C1A10]">

      {/* Nav minimaliste */}
      <nav className="border-b border-[#1A2D22] px-4 py-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="font-serif text-xl text-primary-light font-bold tracking-tight">
            FamilyFund
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 max-w-3xl py-20">
        <p className="text-white/40 text-sm uppercase tracking-widest font-medium mb-4">Blog</p>
        <h1 className="font-serif text-4xl text-white mb-12">
          Love money & financement entre proches
        </h1>

        {posts.length === 0 ? (
          <p className="text-white/40">Aucun article publié pour le moment.</p>
        ) : (
          <div className="space-y-5">
            {posts.map((post) => (
              <Link
                key={post._id}
                href={`/blog/${post.slug?.current}`}
                className="block bg-[#132019] border border-[#27412E] rounded-2xl p-7 hover:border-primary/50 transition-colors group"
              >
                <p className="text-white/40 text-xs mb-3">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })
                    : ''}
                </p>
                <h2 className="font-serif text-xl text-white mb-2 group-hover:text-primary-light transition-colors">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-white/60 text-sm leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>
                )}
                <span className="inline-block mt-4 text-primary-light text-sm font-medium">
                  Lire l&apos;article →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
