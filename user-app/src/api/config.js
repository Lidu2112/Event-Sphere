
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
