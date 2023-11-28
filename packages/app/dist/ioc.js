import { IoCContainer, DatabaseSymbol } from 'ijon';
import { UserService } from './services/user-service.js';
const ioc = new IoCContainer();
ioc.put(UserService, [DatabaseSymbol]);
export default ioc;
