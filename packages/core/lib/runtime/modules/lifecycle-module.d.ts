import type { Container } from '@kurdel/ioc';
import type { AppModule } from '../../api/app/app-module.js';
import type { AppConfig } from '../../api/app/config.js';
export declare class LifecycleModule implements AppModule<AppConfig> {
    readonly exports: {
        onStart: import("@kurdel/ioc").InjectionToken<import("../../api/app/lifecycle.js").LifecycleHook[]>;
        onShutdown: import("@kurdel/ioc").InjectionToken<import("../../api/app/lifecycle.js").LifecycleHook[]>;
    };
    register(ioc: Container): Promise<void>;
}
