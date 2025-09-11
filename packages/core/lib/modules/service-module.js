/**
 * ServiceModule
 *
 * - Exports: none
 * - Imports: none
 *
 * Registers application services in the IoC container.
 * Services are typically plain classes that may depend
 * on models or other services.
 */
export const ServiceModule = {
    register(ioc, config) {
        config.services?.forEach((service) => {
            ioc.put(service);
        });
    },
};
//# sourceMappingURL=service-module.js.map