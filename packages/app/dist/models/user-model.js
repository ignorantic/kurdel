import { Model } from 'ijon';
export class UserModel extends Model {
    table = 'users';
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
