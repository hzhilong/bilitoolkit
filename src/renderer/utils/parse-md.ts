import MarkdownIt from 'markdown-it'

export function parseReadmeToHtml(markdownIt: MarkdownIt, markdown: string, baseUrl: string) {
  // 处理 markdown 图片
  const defaultImage =
    markdownIt.renderer.rules.image || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))

  markdownIt.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const src = token.attrGet('src')

    if (src) {
      token.attrSet('src', new URL(src, baseUrl).href)
    }

    return defaultImage(tokens, idx, options, env, self)
  }

  // 处理 markdown 链接
  const defaultLinkOpen =
    markdownIt.renderer.rules.link_open || ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))

  markdownIt.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const token = tokens[idx]
    const href = token.attrGet('href')

    if (href) {
      token.attrSet('href', new URL(href, baseUrl).href)
    }

    return defaultLinkOpen(tokens, idx, options, env, self)
  }

  let html = markdownIt.render(markdown)

  // 处理原生 html 的 img/src 和 a/href
  html = html.replace(/(src|href)="([^"]+)"/g, (_, attr, url) => `${attr}="${new URL(url, baseUrl).href}"`)

  return html
}
