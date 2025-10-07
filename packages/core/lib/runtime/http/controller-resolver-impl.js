export class ControllerResolverImpl {
    constructor(root) {
        this.root = root;
    }
    /**
     * Resolve controller instance from the provided request scope.
     * Falls back to the root container when not registered in the scope.
     */
    resolve(cls, scope) {
        const c = scope ?? this.root;
        // Prefer request scope; if scope.has() falls back to parent itself, the try-get below is enough.
        if (typeof c.has === 'function') {
            if (c.has(cls))
                return c.get(cls);
            // fallback to root if scope doesn't have it AND has() doesn't climb parents
            if (c !== this.root && this.root.has?.(cls))
                return this.root.get(cls);
        }
        // If has() isn’t available or already climbs to parent, single get() is sufficient.
        try {
            return c.get(cls);
        }
        catch {
            // Final fallback to root
            return this.root.get(cls);
        }
    }
    /** @deprecated kept for backward-compat; prefer resolve(cls, scope) */
    get(cls) {
        return this.root.get(cls);
    }
}
//# sourceMappingURL=controller-resolver-impl.js.map