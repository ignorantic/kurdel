export class UserService {
    async getUser(id) {
        return { id, name: 'Tarantoga' };
    }
    async getUsers() {
        return [{ id: 1, name: 'Tarantoga' }];
    }
}
