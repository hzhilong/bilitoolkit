export class PluginParseUtils {
  public static parsePluginName(id: string, keywords: string[] | undefined): string {
    if (!keywords) {
      return id
    }
    const prefix = 'bilitoolkit-plugin:'
    for (const keyword of keywords) {
      if (keyword.startsWith(prefix) && keyword.length > prefix.length) {
        return keyword.substring(prefix.length)
      }
    }
    return id
  }

  static isHttpUrl(path: string){
    return /^https?:\/\//i.test(path)
  }


}
