// Admin utility functions
export const getAdminEmails = (): string[] => {
  const adminEmailsEnv = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  if (!adminEmailsEnv) return [];

  try {
    // Handle array format: [email1,email2] or just comma-separated: email1,email2
    const cleanEmails = adminEmailsEnv
      .replace(/[\[\]]/g, "") // Remove brackets if present
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter((email) => email.length > 0);

    return cleanEmails;
  } catch (error) {
    console.error("Error parsing admin emails:", error);
    return [];
  }
};

export const isUserAdmin = (userEmail: string | null | undefined): boolean => {
  if (!userEmail) return false;

  const adminEmails = getAdminEmails();
  return adminEmails.includes(userEmail.toLowerCase());
};

/** UI-only hint (shows admin links). Real access is enforced on the server. */
export const useIsAdmin = (userEmail: string | null | undefined): boolean => {
  return isUserAdmin(userEmail);
};
