export const ADMIN_EMAILS = [
  process.env.ADMIN_EMAIL,
  process.env.NEXT_PUBLIC_ADMIN_EMAIL,
  'marcosvlogs12@gmail.com',
  'teste@creatorflowia.com',
  'teste@creatorflow.com',
].filter(Boolean) as string[];

export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}
