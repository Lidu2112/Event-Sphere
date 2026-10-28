const configuredApiBaseUrl =
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.PROD
        ? 'https://event-sphere-lgri.onrender.com'
        : 'http://localhost:5000');

export const API_BASE_URL = configuredApiBaseUrl.replace(/\/+$/, '');

export function apiUrl(path) {
    return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export function imageUrl(path) {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}
