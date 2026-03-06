import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { PortableText } from '@portabletext/react'
import { client } from '@/sanity/lib/client'

export const dynamic = 'force-dynamic'

const POST_QUERY = `
  *[_type == "post" && slug.current == $slug][0] {
    title, slug, excerpt, publishedAt, body, seoDescription
  }
`

interface Post {
  title: string
  slug: { current: string }
  excerpt?: string
  publishedAt?: string
  body?: any[]
  seoDescription?: string
}

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await client.fetch<Post | null>(POST_QUERY, { slug: params.slug })
  if (!post) return {}
  return {
    title: `${post.title} — FamilyFund`,
    description: post.seoDescription ?? post.excerpt ?? undefined,
  }
}

export default async function BlogPostPage({ params }: Props) {
  const post = await client.fetch<Post | null>(POST_QUERY, { slug: params.slug })

  if (!post) notFound()

  return (
    <main className="min-h-screen bg-[#0C1A10]">

      {/* Nav minimaliste */}
      <nav className="border-b border-[#1A2D22] px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/" className="font-serif text-xl text-primary-light font-bold tracking-tight">
            FamilyFund
          </Link>
          <span className="text-white/20">·</span>
          <Link href="/blog" className="text-sm text-white/50 hover:text-white transition-colors">
            Blog
          </Link>
        </div>
      </nav>

      <article className="container mx-auto px-4 max-w-2xl py-16">

        {/* En-tête */}
        <header className="mb-12">
          {post.publishedAt && (
            <p className="text-white/40 text-sm mb-4">
              {new Date(post.publishedAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          )}
          <h1 className="font-serif text-4xl md:text-5xl text-white leading-tight mb-5">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="text-white/60 text-lg leading-relaxed border-l-2 border-primary pl-4">
              {post.excerpt}
            </p>
          )}
        </header>

        {/* Corps de l'article */}
        {post.body && (
          <div className="prose-blog">
            <PortableText value={post.body} />
          </div>
        )}

        {/* CTA de fin d'article */}
        <div className="mt-16 bg-[#132019] border border-[#27412E] rounded-2xl p-8 text-center">
          <p className="font-serif text-xl text-white mb-2">
            Prêt à organiser votre love money ?
          </p>
          <p className="text-white/60 text-sm mb-6">
            FamilyFund structure le financement de vos proches — proprement.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-colors text-sm"
          >
            Obtenir mon accès anticipé →
          </Link>
        </div>

      </article>
    </main>
  )
}
