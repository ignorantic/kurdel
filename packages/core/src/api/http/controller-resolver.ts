export interface ControllerResolver {
  get<T>(cls: new (...a: any[]) => T): T;
}
 
