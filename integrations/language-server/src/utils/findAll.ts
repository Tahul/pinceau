export function findAll(re: RegExp, str: string): RegExpMatchArray[] {
  let match: RegExpMatchArray
  const matches: RegExpMatchArray[] = []
  // eslint-disable-next-line no-cond-assign
  while ((match = re.exec(str) as any) !== null) { matches.push({ ...match }) }

  return matches
}
