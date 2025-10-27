export class UserService {
  users = [
    {
      id: 1,
      name: 'Tarantoga',
      role: 'admin'
    },
    {
      id: 2,
      name: 'Pirx',
      role: 'pilot'
    },
    {
      id: 3,
      name: 'Ijon',
      role: 'pilot'
    },
    {
      id: 4,
      name: 'Snaut',
      role: 'scientist'
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
