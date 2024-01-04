import { Controller, RouteConfig } from '@kurdel/common';
import { UserModel } from 'models/user-model.js';

export class UserController extends Controller<UserController> {
  private service: UserModel;

  routes: RouteConfig<UserController> = [
    {
      method: 'POST',
      path: '/user',
      action: 'create',
    },
    {
      method: 'GET',
      path: '/user',
      action: 'getOne',
    },
    {
      method: 'GET',
      path: '/users',
      action: 'getAll',
    }
  ];

  constructor(service: UserModel) {
    super();
    this.service = service;
  }

  async create() {
    const { name } = this.query;

    if (typeof name !== 'string') {
      this.sendError(400, 'Name not found');
      return;
    } 

    try {
      await this.service.createUser(name);
      this.send(200, { message: 'OK' });
    } catch (err) {
      this.sendError(500, JSON.stringify(err));
    }
  }

  async getOne() {
    const { id } = this.query;

    if (typeof id !== 'string') {
      this.sendError(400, 'Name not found');
      return;
    } 

    const userId = +id;

    if (typeof userId !== 'number') {
      this.sendError(400, 'Name not found');
      return;
    } 

    try {
      const record = await this.service.getUser(userId);
      this.send(200, record);
    } catch (err) {
      this.sendError(500, JSON.stringify(err));
    }
  }

  async getAll() {
    try {
      const records = await this.service.getUsers();
      this.send(200, records);
    } catch (err) {
      this.sendError(500, JSON.stringify(err));
    }
  }
}
