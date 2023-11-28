import { Model } from 'ijon';

export class UserModel extends Model {
  table = 'users';

  public async createUser(name: string) {
    return this.create({ id: null, name });
  }

  public async getUser(id: number) {
    return this.find('id', [id]);
  }

  public async getUsers() {
    return this.findAll();
  }
}
