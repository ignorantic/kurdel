export const ROUTE_META = Symbol('@kurdel/core:route-meta');
/**
 * route(meta)(handler) preserves the handler and tags it with metadata.
 * Typing-wise, it narrows ctx.params for the handler from meta.path.
 */
export function route(meta) {
    return function (fn) {
        fn[ROUTE_META] = meta;
        return fn;
    };
}
//# sourceMappingURL=route.js.map