import { describe, it, expect, vi, beforeEach } from 'vitest';
import { IoCContainer } from 'src/runtime/ioc-container.js';

describe('IoCContainer#getGraph()', () => {
  let container: IoCContainer;

  class Logger {}
  class Config {}
  class Db {
    static deps = { config: Config, logger: Logger };
    constructor(public deps: { config: Config; logger: Logger }) {}
  }
  class App {
    static deps = { db: Db, logger: Logger };
    constructor(public deps: { db: Db; logger: Logger }) {}
  }

  beforeEach(() => {
    container = new IoCContainer();
  });

  it('builds dependency graph for a simple hierarchy', () => {
    container.put(Logger);
    container.put(Config);
    container.put(Db).with({ config: Config, logger: Logger });
    container.put(App).with({ db: Db, logger: Logger });

    const graph = container.getGraph(App);

    expect(graph).toHaveLength(1);
    const appNode = graph[0];
    expect(appNode.key).toContain('App');
    expect(appNode.deps.map(d => d.key)).toContain('Db');
    expect(appNode.deps.map(d => d.key)).toContain('Logger');

    const dbNode = appNode.deps.find(d => d.key.includes('Db'));
    expect(dbNode?.deps.map(d => d.key)).toContain('Config');
    expect(dbNode?.deps.map(d => d.key)).toContain('Logger');
  });

  it('marks missing bindings as (unbound)', () => {
    container.put(App).with({ db: class Missing {} as any, logger: class Log {} as any });
    const graph = container.getGraph(App);
    const node = graph[0];
    expect(node.deps.some(d => d.key.includes('(unbound)'))).toBe(true);
  });

  it('detects circular dependencies safely', () => {
    class A { static deps = { b: null as any }; }
    class B { static deps = { a: A }; }
    A.deps.b = B;

    container.put(A).with({ b: B });
    container.put(B).with({ a: A });

    const graph = container.getGraph(A);
    const aNode = graph[0];
    const bNode = aNode.deps[0];
    // Should not recurse infinitely
    expect(bNode.deps[0].key).toContain('(circular)');
  });

  it('includes parent container bindings with [parent] mark', () => {
    const parent = new IoCContainer();
    parent.put(Logger);

    const child = parent.createScope();
    child.put(App).with({ db: Logger, logger: Logger }); // logger in parent

    const graph = child.getGraph(App);
    const appNode = graph[0];
    expect(appNode.deps.some(d => d.key.includes('[parent]'))).toBe(true);
  });
});

describe('IoCContainer#printGraph()', () => {
  it('prints a tree structure without throwing', () => {
    const c = new IoCContainer();
    class Logger {}
    class Config {}
    c.put(Logger);
    c.put(Config);
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {});
    expect(() => c.printGraph()).not.toThrow();
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
