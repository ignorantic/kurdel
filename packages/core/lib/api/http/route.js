export const ROUTE_META = Symbol('route:meta');
/**
 * route(meta)(handler) preserves the handler and tags it with metadata.
 * Typing-wise, it narrows ctx.params for the handler from meta.path.
 */
export function route(meta) {
    return function (fn) {
        const wrapped = function (...args) {
            return fn.apply(this, args);
        };
        wrapped[ROUTE_META] = meta;
        return wrapped;
    };
}
//# sourceMappingURL=route.js.map