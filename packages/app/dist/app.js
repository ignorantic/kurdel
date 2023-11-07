import { Application } from 'ijon';
import { router } from './router.js';
const app = new Application(router);
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000\n');
});
