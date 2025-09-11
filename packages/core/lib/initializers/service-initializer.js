export class ServiceInitializer {
    run(ioc, config) {
        config.services?.forEach((service) => {
            ioc.put(service);
        });
    }
}
//# sourceMappingURL=service-initializer.js.map