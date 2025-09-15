export const unique = function <T extends undefined | number | string>(data: undefined | null | T[]): T[] {
  if (!data || !data.length) {
    return []
  }
  return data.reduce((acc: T[], curr: T) => {
    if (curr !== undefined && !acc.includes(curr)) {
      acc.push(curr)
    }
    return acc
  }, [] as T[])
}
