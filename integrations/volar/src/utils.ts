export const stringsToUnionType = (strings: string[]) => strings.filter(Boolean).map(token => `'${token}'`).join(' | ')
