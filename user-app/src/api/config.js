
const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.PROD
        ? "https://event-sphere-lgri.onrender.com"
        : "http://localhost:5000")
).replace(/\/+$/, "");

export { API_BASE_URL };

export function apiUrl(path) {
    if (!path) return API_BASE_URL;

    // Preserve external URLs (for example Cloudinary), but repair legacy
    // localhost URLs saved by the app before deployment.
    if (/^(https?:)?\/\//i.test(path)) {
        try {
            const url = new URL(path);
            if (["localhost", "127.0.0.1"].includes(url.hostname)) {
                return `${API_BASE_URL}${url.pathname}${url.search}`;
            }
        } catch {
            return path;
        }
        return path;
    }

    return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function imageUrl(path) {
    if (!path) return "";

    const url = apiUrl(path);
    // The original event uploads are bundled with the frontend because the
    // hosted backend uses ephemeral storage. Future uploads remain remote.
    try {
        const parsed = new URL(url);
        if (parsed.pathname.startsWith("/uploads/")) {
            const fileName = parsed.pathname.substring("/uploads/".length);
            if (/^banner_\d+\.(jpg|jpeg|png|webp)$/i.test(fileName)) {
                return `/images/events/${fileName}`;
            }
            if (parsed.pathname.startsWith("/uploads/services/")) {
                return "/images/default-vendor.svg";
            }
        }
    } catch {
        // Relative asset URLs are valid and are handled below.
    }

    return url;
}
