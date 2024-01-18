import { IoCContainer } from '../src/container.js';

describe('put', () => {
  let iocContainer: IoCContainer;

  beforeEach(() => {
    iocContainer = new IoCContainer();
  });

  test('should register and retrieve a dependency', () => {
    class TestClass {}

    iocContainer.put<TestClass>(TestClass);
    const instance = iocContainer.get<TestClass>(TestClass);

    expect(instance).toBeDefined();
    expect(instance).toBeInstanceOf(TestClass);
  });

  test('should retrieve an injection', () => {
    class TestClass1 {}

    class TestClass2 {
      public dependency: TestClass1;

      constructor(dependency: TestClass1) {
        this.dependency = dependency;
      }
    }

    iocContainer.put(TestClass1);
    iocContainer.put(TestClass2).with([TestClass1]);
    const instance = iocContainer.get<TestClass2>(TestClass2);

    expect(instance).toBeInstanceOf(TestClass2);
    expect(instance.dependency).toBeInstanceOf(TestClass1);
  });

  test('should retrieve a transient instance', () => {
    class TestClass {
      count = 0;
    }

    iocContainer.put<TestClass>(TestClass);
    const instance1 = iocContainer.get<TestClass>(TestClass);
    const instance2 = iocContainer.get<TestClass>(TestClass);

    instance1.count += 1;
    expect(instance2.count).toEqual(0);
  });

  test('should retrieve a singleton', () => {
    class TestClass {
      count = 0;
    }

    iocContainer.put<TestClass>(TestClass).inSingletonScope();
    const instance1 = iocContainer.get<TestClass>(TestClass);
    const instance2 = iocContainer.get<TestClass>(TestClass);

    instance1.count += 1;
    expect(instance2.count).toEqual(1);
  });

  test('should throw', () => {
    class TestClass {}

    iocContainer.put<TestClass>(TestClass);
    const tryPutAgain = () => { iocContainer.put<TestClass>(TestClass); }

    expect(tryPutAgain).toThrow();
  });
});
