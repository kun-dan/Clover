/** The set of reading statuses a library entry can hold. Single source of truth:
 *  the DB stores this as a plain string, so validation lives here, not in Prisma. */
export const VALID_STATUSES = ["READING", "PLAN_TO_READ", "COMPLETED", "DROPPED"] as const;

export type LibraryStatus = (typeof VALID_STATUSES)[number];

export function isValidStatus(value: unknown): value is LibraryStatus {
  return typeof value === "string" && (VALID_STATUSES as readonly string[]).includes(value);
}
