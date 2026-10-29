
const API_BASE_URL = (
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.PROD
        ? "https://event-sphere-lgri.onrender.com"
        : "http://localhost:5000")
).replace(/\/+$/, "");

export { API_BASE_URL };

export function apiUrl(path) {
    return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export function imageUrl(path) {
    if (!path) return "";

    let normalizedPath = String(path).trim().replace(/\\/g, "/");
    const localImageUrl = normalizedPath.match(
        /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(\/[^?#]*)?([?#].*)?$/i
    );

    if (localImageUrl) {
        normalizedPath = `${localImageUrl[1] || "/"}${localImageUrl[2] || ""}`;
    } else if (/^(?:https?:)?\/\//i.test(normalizedPath) || /^(?:data|blob):/i.test(normalizedPath)) {
        return normalizedPath;
    }

    const uploadsPath = normalizedPath.match(/(?:^|\/)uploads\/(.+)$/i);
    if (!uploadsPath) return apiUrl(normalizedPath);

    const uploadPath = `/uploads/${uploadsPath[1]}`;
    const eventBanner = uploadsPath[1].match(/^banner_[^/]+$/i);
    if (eventBanner) return `/images/events/${eventBanner[0]}`;

    return apiUrl(uploadPath);
}
