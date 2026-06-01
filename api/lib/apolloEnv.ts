/** Server-side Apollo key (Vercel env names vary). */
export function getServerApolloKey(): string {
  return (
    process.env.APOLLO_API_KEY ||
    process.env.Apollo_Key ||
    process.env.APOLLO_KEY ||
    ''
  ).trim()
}
