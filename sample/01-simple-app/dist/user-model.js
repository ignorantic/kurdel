import { Model } from '@kurdel/core/db';
export class UserModel extends Model {
    table = 'users';
    async createUser(name, role) {
        return this.create({ id: null, name, role });
    }
    async getUser(id) {
        return this.find('id', [id]);
    }
    async getUsers() {
        return this.findAll();
    }
}
