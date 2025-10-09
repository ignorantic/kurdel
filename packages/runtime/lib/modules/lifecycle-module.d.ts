import type { Container } from '@kurdel/ioc';
import type { AppModule, AppConfig } from '@kurdel/core/app';
export declare class LifecycleModule implements AppModule<AppConfig> {
    readonly exports: {
        onStart: import("@kurdel/ioc").InjectionToken<import("@kurdel/core/app").LifecycleHook[]>;
        onShutdown: import("@kurdel/ioc").InjectionToken<import("@kurdel/core/app").LifecycleHook[]>;
    };
    register(ioc: Container): Promise<void>;
}
