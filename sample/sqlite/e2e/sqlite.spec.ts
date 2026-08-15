import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Server } from 'node:http';
import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sqlite3 from 'sqlite3';

import { createNodeApplication } from '@kurdel/facade';
import type { Application } from '@kurdel/core/app';
import type { RunningServer } from '@kurdel/core/http';

import { UserModule } from '../src/user-module.js';

describe('E2E: working with sqlite database', () => {
  let app: Application;
  let server: RunningServer | undefined;
  let rawServer: Server;
  let fixtureDirectory: string | undefined;
  const originalWorkingDirectory = process.cwd();

  beforeAll(async () => {
    fixtureDirectory = await mkdtemp(join(tmpdir(), 'kurdel-sqlite-'));
    const databaseFilename = join(fixtureDirectory, 'sqlite.db');

    await writeFile(
      join(fixtureDirectory, 'db.config.json'),
      JSON.stringify({ type: 'sqlite', filename: databaseFilename })
    );
    await createSchema(databaseFilename);
    process.chdir(fixtureDirectory);

    app = await createNodeApplication({
      modules: [new UserModule()],
    });
    server = app.listen(0);
    rawServer = server.raw?.<Server>() as Server;
    if (!rawServer) throw new Error('Server not started');
  });

  afterAll(async () => {
    await server?.close();
    process.chdir(originalWorkingDirectory);
    if (fixtureDirectory) {
      await rm(fixtureDirectory, { recursive: true, force: true });
    }
  });
  
  it('return response with status 200', async () => {
    const res = await request(rawServer)
      .get('/users')

    expect(res.status).toBe(200);
  });
});

async function createSchema(filename: string): Promise<void> {
  const database = new sqlite3.Database(filename);

  await new Promise<void>((resolve, reject) => {
    database.run(
      'CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, role TEXT)',
      error => error ? reject(error) : resolve()
    );
  });

  await new Promise<void>((resolve, reject) => {
    database.close(error => error ? reject(error) : resolve());
  });
}
