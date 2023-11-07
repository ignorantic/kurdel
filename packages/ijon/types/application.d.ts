import { Router } from './router.js';
export declare class Application {
    private router;
    constructor(router: Router);
    listen(port: number, callback: () => void): void;
}
