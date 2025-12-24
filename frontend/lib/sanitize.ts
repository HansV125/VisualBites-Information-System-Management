/**
 * Simple HTML sanitizer to prevent XSS attacks
 * Removes dangerous HTML tags and attributes
 */
export function sanitizeHtml(input: string): string {
    if (!input) return '';

    // Remove script tags and their content
    let clean = input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

    // Remove event handlers
    clean = clean.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
    clean = clean.replace(/\s*on\w+\s*=\s*[^\s>]*/gi, '');

    // Remove javascript: URLs
    clean = clean.replace(/javascript:/gi, '');

    // Remove data: URLs (can be used for XSS)
    clean = clean.replace(/data:/gi, '');

    // Remove style tags (can be used for CSS injection)
    clean = clean.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

    // Remove iframe, object, embed tags
    clean = clean.replace(/<(iframe|object|embed|form)[^>]*>[\s\S]*?<\/\1>/gi, '');
    clean = clean.replace(/<(iframe|object|embed|form)[^>]*\/?>/gi, '');

    return clean;
}

/**
 * Escape HTML entities for safe display
 */
export function escapeHtml(input: string): string {
    if (!input) return '';

    const escapeMap: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '/': '&#x2F;',
    };

    return input.replace(/[&<>"'/]/g, char => escapeMap[char] || char);
}

/**
 * Sanitize input for use in URLs
 */
export function sanitizeUrl(url: string): string {
    if (!url) return '';

    try {
        const parsed = new URL(url);
        // Only allow http, https protocols
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return '';
        }
        return parsed.href;
    } catch {
        // If not a valid URL, return empty
        return '';
    }
}

/**
 * Sanitize phone number input
 */
export function sanitizePhone(phone: string): string {
    if (!phone) return '';
    // Only keep digits and plus sign
    return phone.replace(/[^\d+]/g, '');
}
