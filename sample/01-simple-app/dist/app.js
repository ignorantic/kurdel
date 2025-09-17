import { Application } from '@kurdel/core';
import { UserModule } from './user-module.js';
const app = await Application.create({
    modules: [new UserModule()]
});
app.listen(3000, () => {
    console.log(`Server is running on http://localhost:3000\n`);
});
