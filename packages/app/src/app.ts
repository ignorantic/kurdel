import { Application } from 'ijon';
import ioc from './ioc.js';

const config = {
  port: 3000,
  database: {
    type: 'sqlite',
    filename: './test.db',
    user: '',
    password: '',
    host: '',
    port: 8888,
  }
};

const app = new Application(config, ioc);

app.start();

