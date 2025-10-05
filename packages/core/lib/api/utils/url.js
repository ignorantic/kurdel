const INTERNAL_BASE = 'http://internal';
export function buildURL(req) {
    // do not trust host header; use fixed base
    return new URL(req.url ?? '/', INTERNAL_BASE);
}
export function toQuery(u) {
    const out = {};
    u.searchParams.forEach((value, key) => {
        if (key in out) {
            const prev = out[key];
            out[key] = Array.isArray(prev) ? [...prev, value] : [prev, value];
        }
        else {
            out[key] = value;
        }
    });
    return out;
}
//# sourceMappingURL=url.js.map