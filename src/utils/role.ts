import { UserRole } from "@/types/auth";

/**
 * Translates a user role into its Swedish equivalent.
 *
 * @function translateRoleToSwedish
 * @param {UserRole} role - The role to be translated (validated against the Zod schema).
 * @returns {string} The Swedish translation of the role, or the original string if the role is unknown.
 * 
 * @example
 * translateRoleToSwedish("admin"); // Returns "Admin"
 * translateRoleToSwedish("user");  // Returns "Användare"
 */
export const translateRoleToSwedish = (role: UserRole) => {
    switch (role) {
        case "user":
            return "Användare";
        case "admin":
            return "Admin";
        default:
            return role;
    }
};