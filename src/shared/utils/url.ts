export const isHttpUrl = (path: string) => {
  return /^https?:\/\//i.test(path)
}
