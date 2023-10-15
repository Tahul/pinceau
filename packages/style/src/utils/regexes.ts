import { elements } from './html-elements'

export const PRESENCE_REGEX = new RegExp(`(\\$styled\\.(${elements.join('|')})|styled|css)(?:\())`, 'g')

export const IDENTIFIER_REGEX = new RegExp(`^(\\$styled\\.(${elements.join('|')})|styled|css)`)
