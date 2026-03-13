import { defineField, defineType } from 'sanity'

export const callout = defineType({
  name: 'callout',
  title: 'Encadré callout',
  type: 'object',
  fields: [
    defineField({
      name: 'type',
      title: 'Type',
      type: 'string',
      options: {
        list: [
          { title: 'Info', value: 'info' },
          { title: 'Avertissement', value: 'warning' },
          { title: 'CTA', value: 'cta' },
        ],
        layout: 'radio',
      },
      initialValue: 'info',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'content',
      title: 'Contenu',
      type: 'text',
      rows: 3,
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Texte du bouton (optionnel)',
      type: 'string',
    }),
    defineField({
      name: 'ctaUrl',
      title: 'URL du bouton (optionnel)',
      type: 'url',
    }),
  ],
  preview: {
    select: { title: 'content', subtitle: 'type' },
  },
})
