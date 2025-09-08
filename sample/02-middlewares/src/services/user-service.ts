export class UserService {
  public async getUser(id: number) {
    return { id, name: 'Tarantoga'};
  }

  public async getUsers() {
    return [{ id: 1, name: 'Tarantoga'}];
  }
}
