export class UserService {
  users = [
    {
      id: 1,
      name: 'Tarantoga'
    },
    {
      id: 2,
      name: 'Pirx'
    },
    {
      id: 3,
      name: 'Ijon'
    },
    {
      id: 4,
      name: 'Snaut'
    }
  ]

  public async getUser(id: number) {
    const user = this.users.find(record => record.id === id);
    return user;
  }

  public async getUsers() {
    return this.users;
  }
}
