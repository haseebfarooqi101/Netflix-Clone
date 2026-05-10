declare module 'uuid' {
  export function v4(): string
  export function v1(): string
}

declare module 'js-cookie' {
  const Cookies: {
    get(name: string): string | undefined
    set(name: string, value: string, options?: object): void
    remove(name: string, options?: object): void
  }
  export default Cookies
}
