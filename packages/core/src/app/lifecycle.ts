export type LifecycleHook = () => void | Promise<void>;

export type OnStartHook = LifecycleHook;
export type OnShutdownHook = LifecycleHook;
