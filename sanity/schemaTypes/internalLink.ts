import { defineField, defineType } from 'sanity'

export const internalLink = defineType({
  name: 'internalLink',
  title: 'Lien interne',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      title: 'Texte affiché',
      type: 'string',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'post',
      title: 'Article lié',
      type: 'reference',
      to: [{ type: 'post' }],
      validation: (r) => r.required(),
    }),
  ],
  preview: {
    select: { title: 'label' },
  },
})
