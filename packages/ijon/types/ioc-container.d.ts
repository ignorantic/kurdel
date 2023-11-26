export declare class IoCContainer {
    private readonly dependencies;
    register<T>(name: string, constructor: {
        new (...args: any[]): T;
    }, dependencies: string[]): void;
    registerInstance<T>(name: string, instance: T): void;
    resolve<T>(name: string): T;
}
