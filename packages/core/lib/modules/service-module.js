/**
 * ServiceModule
 *
 * - Registers application services from AppConfig
 * - Does not export anything directly (services consumed by controllers)
 */
export class ServiceModule {
    async register(ioc, config) {
        const { services = [] } = config;
        services.forEach((service) => ioc.put(service));
    }
}
//# sourceMappingURL=service-module.js.map