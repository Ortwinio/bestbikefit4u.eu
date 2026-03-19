import type { Doc } from "../../convex/_generated/dataModel";

type UserIdentity = Pick<
  Doc<"users">,
  | "displayName"
  | "displayNameSource"
  | "email"
  | "name"
  | "profile_image_url"
  | "googleName"
  | "googleProfileImageUrl"
  | "image"
>;

function getEmailLocalPart(email?: string) {
  return email?.split("@")[0]?.trim() || null;
}

export function getEffectiveDisplayName(
  user: UserIdentity | null | undefined,
  fallbackName?: string
) {
  return (
    user?.displayName?.trim() ||
    user?.googleName?.trim() ||
    user?.name?.trim() ||
    getEmailLocalPart(user?.email) ||
    fallbackName ||
    ""
  );
}

export function getEffectiveProfileImageSource(
  user: UserIdentity | null | undefined
) {
  return (
    user?.profile_image_url ||
    user?.googleProfileImageUrl ||
    user?.image ||
    undefined
  );
}
