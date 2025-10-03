import { ApplicationImpl } from '../runtime/app/application-impl.js';
/**
 * Runtime façade that constructs and bootstraps the application,
 * returning only the public Application interface.
 */
export async function createApplication(config = {}) {
    const impl = new ApplicationImpl(config);
    await impl.bootstrap();
    return impl;
}
//# sourceMappingURL=create-application.js.map