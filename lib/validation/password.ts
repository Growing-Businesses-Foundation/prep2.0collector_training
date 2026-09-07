export const PASSWORD_MIN_LENGTH = 8;

export function validatePassword(password: string): string | null {
    if (!password) {
        return "Password is required.";
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
        return `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`;
    }

    if (password.length > 128) {
        return "Password must not exceed 128 characters.";
    }

    if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter.";
    }

    if (!/[a-z]/.test(password)) {
        return "Password must contain at least one lowercase letter.";
    }

    if (!/[0-9]/.test(password)) {
        return "Password must contain at least one number.";
    }

    return null;
}
