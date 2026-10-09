export function getAuthSecret() {
  const value = process.env.AUTH_SECRET;
  if (
    process.env.NODE_ENV === "production" &&
    (!value || value.length < 32 || value === "development-only-secret-change-me")
  ) {
    throw new Error(
      "AUTH_SECRET must contain at least 32 characters in production.",
    );
  }
  return new TextEncoder().encode(value ?? "development-only-secret-change-me");
}
