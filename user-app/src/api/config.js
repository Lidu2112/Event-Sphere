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
    
    // Handle full external URLs (Cloudinary, S3, etc.) or Data/Blob URIs
    if (/^(?:https?:)?\/\//i.test(normalizedPath) || /^(?:data|blob):/i.test(normalizedPath)) {
        // Strip out local host domain if stored with localhost during dev
        const localMatch = normalizedPath.match(
            /^https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(\/[^?#]*)?([?#].*)?$/i
        );
        if (localMatch) {
            normalizedPath = `${localMatch[1] || "/"}${localMatch[2] || ""}`;
        } else {
            return normalizedPath;
        }
    }

    // Ensure relative paths correctly point to backend uploads or routes
    const uploadsPath = normalizedPath.match(/(?:^|\/)uploads\/(.+)$/i);
    if (uploadsPath) {
        return apiUrl(`/uploads/${uploadsPath[1]}`);
    }

    // If it's already a full relative path starting with / or api
    return apiUrl(normalizedPath);
}