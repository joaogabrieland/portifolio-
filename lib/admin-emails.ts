export const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL,
].filter(Boolean) as string[];

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
