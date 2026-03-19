type UserIdentity = {
  displayName?: string;
  displayNameSource?: string;
  email?: string;
  name?: string;
  profile_image_url?: string;
  googleName?: string;
  googleProfileImageUrl?: string;
  image?: string;
};

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
): string | undefined {
  return (
    user?.profile_image_url ||
    user?.googleProfileImageUrl ||
    user?.image ||
    undefined
  );
}
