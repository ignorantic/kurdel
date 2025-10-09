import { RuntimeApplication } from '@kurdel/runtime/app';
/**
 * Runtime façade that constructs and bootstraps the application,
 * returning only the public Application interface.
 */
export async function createApplication(config = {}) {
    const impl = new RuntimeApplication(config);
    await impl.bootstrap();
    return impl;
}
//# sourceMappingURL=create-application.js.map