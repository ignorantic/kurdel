export function createToken(key, global = false) {
    const s = global ? Symbol.for(key) : Symbol(key);
    return s;
}
export const createGlobalToken = (key) => createToken(key, true);
export const createLocalToken = (key) => createToken(key, false);
//# sourceMappingURL=injection-token.js.map