import { Service } from 'ijon';
export class UserService extends Service {
    constructor(db) {
        super(db, 'users');
    }
    async createUser(name) {
        return this.create({ id: null, name });
    }
    async getUser(id) {
        return this.find('id', [id]);
    }
    async getUsers() {
        return this.findAll();
    }
}
