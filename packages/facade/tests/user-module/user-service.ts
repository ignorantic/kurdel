export class UserService {
  private users = [{ id: 1, name: 'Alice' }];

  findAll() {
    return this.users;
  }

  create(name: string) {
    const user = { id: this.users.length + 1, name };
    this.users.push(user);
    return user;
  }
}
