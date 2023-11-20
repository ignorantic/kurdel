import { Service } from 'ijon';
export class UserService extends Service {
    constructor(db) {
        super(db, 'users');
    }
    async createUser(names) {
        return this.create(names);
    }
    async getUser(id) {
        return this.find(id);
    }
    async getUsers() {
        return this.all();
    }
}
