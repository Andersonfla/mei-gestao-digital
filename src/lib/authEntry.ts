/** Only public UI navigation; authentication and plan rules remain unchanged. */
export function getAuthEntry(search: string) {
  const params = new URLSearchParams(search);
  return {
    tab: params.get("tab") === "signup" ? "signup" as const : "login" as const,
  };
}