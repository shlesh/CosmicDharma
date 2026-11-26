// next-pwa 5 ships no type declarations.
declare module 'next-pwa' {
  const withPWA: (options: Record<string, unknown>) => <T>(config: T) => T;
  export default withPWA;
}

declare module 'next-pwa/cache' {
  const runtimeCaching: Array<Record<string, unknown>>;
  export default runtimeCaching;
}
