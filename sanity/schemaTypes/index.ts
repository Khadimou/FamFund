import { type SchemaTypeDefinition } from 'sanity'
import { post } from './post'
import { callout } from './callout'
import { faqBlock } from './faqBlock'
import { internalLink } from './internalLink'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [post, callout, faqBlock, internalLink],
}
