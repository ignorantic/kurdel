import { describe, it, expect, vi } from 'vitest';
import { Application } from '../../src/application.js';
import { IServerAdapter } from '../../src/http/interfaces.js';

describe('Application', () => {
  it('should create application without errors', async () => {
    const app = await Application.create({ db: false });
    expect(app).toBeInstanceOf(Application);
  });

  it('should call server.listen when app.listen is invoked', async () => {
    class FakeServer implements IServerAdapter {
      listen = vi.fn();
      getHttpServer = vi.fn(); 
    }

    const app = await Application.create({ db: false, server: FakeServer });
    app.listen(3000, () => {});
    const server = app.getContainer().get<IServerAdapter>(IServerAdapter);

    expect(server.listen).toHaveBeenCalled();
    expect(server.listen).toHaveBeenCalledWith(3000, expect.any(Function));
  });
});
