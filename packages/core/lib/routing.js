export const ROUTE_META = Symbol('route:meta');
export function route(meta) {
    return function (fn) {
        fn[ROUTE_META] = meta;
        return fn;
    };
}
//# sourceMappingURL=routing.js.map