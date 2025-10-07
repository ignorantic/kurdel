export const ROUTE_META = Symbol('route:meta');
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