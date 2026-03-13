import { PortableText, type PortableTextComponents } from '@portabletext/react'

interface CalloutValue {
  _type: 'callout'
  type: 'info' | 'warning' | 'cta'
  content: string
  ctaLabel?: string
  ctaUrl?: string
}

interface FaqItem {
  _key: string
  question: string
  answer: string
}

interface FaqBlockValue {
  _type: 'faqBlock'
  items?: FaqItem[]
}

interface InternalLinkValue {
  _type: 'internalLink'
  label: string
  post?: {
    title: string
    slug: string
  }
}

const calloutStyles: Record<
  'info' | 'warning' | 'cta',
  { wrapper: string; border: string }
> = {
  info: { wrapper: 'bg-blue-50', border: 'border-blue-400' },
  warning: { wrapper: 'bg-amber-50', border: 'border-[#F4A261]' },
  cta: { wrapper: 'bg-green-50', border: 'border-[#2D6A4F]' },
}

const components: PortableTextComponents = {
  types: {
    callout: ({ value }: { value: CalloutValue }) => {
      const styles = calloutStyles[value.type] ?? calloutStyles.info
      return (
        <div
          className={`${styles.wrapper} ${styles.border} border-l-4 rounded-r-lg px-5 py-4 my-6`}
        >
          <p className="text-gray-800 text-sm leading-relaxed">{value.content}</p>
          {value.ctaUrl && (
            <a
              href={value.ctaUrl}
              className="inline-block mt-3 text-sm font-semibold text-[#2D6A4F] hover:underline"
            >
              {value.ctaLabel ?? value.ctaUrl} →
            </a>
          )}
        </div>
      )
    },

    faqBlock: ({ value }: { value: FaqBlockValue }) => (
      <div className="my-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Questions fréquentes</h2>
        <div className="space-y-2">
          {value.items?.map((item) => (
            <details
              key={item._key}
              className="group rounded-lg border border-gray-200 bg-white"
            >
              <summary className="cursor-pointer select-none px-4 py-3 text-sm font-medium text-gray-800 list-none flex items-center justify-between gap-2">
                {item.question}
                <span className="text-gray-400 group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="px-4 pb-4 pt-1 text-sm text-gray-600 leading-relaxed">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    ),

    internalLink: ({ value }: { value: InternalLinkValue }) => {
      if (!value.post?.slug) return null
      return (
        <div className="my-6 rounded-lg bg-gray-100 border border-gray-200 px-5 py-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
            À lire aussi
          </p>
          <a
            href={`/blog/${value.post.slug}`}
            className="text-sm font-medium text-[#2D6A4F] hover:underline"
          >
            {value.label}
          </a>
        </div>
      )
    },
  },
}

export function BlogBody({ content }: { content: any[] }) {
  return <PortableText value={content} components={components} />
}
