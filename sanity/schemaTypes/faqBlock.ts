import { defineField, defineType } from 'sanity'

export const faqBlock = defineType({
  name: 'faqBlock',
  title: 'Bloc FAQ',
  type: 'object',
  fields: [
    defineField({
      name: 'items',
      title: 'Questions / Réponses',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({
              name: 'question',
              title: 'Question',
              type: 'string',
              validation: (r) => r.required(),
            }),
            defineField({
              name: 'answer',
              title: 'Réponse',
              type: 'text',
              rows: 3,
              validation: (r) => r.required(),
            }),
          ],
          preview: {
            select: { title: 'question' },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { items: 'items' },
    prepare({ items }: { items?: { question: string }[] }) {
      const count = items?.length ?? 0
      return {
        title: `FAQ — ${count} question${count !== 1 ? 's' : ''}`,
      }
    },
  },
})
