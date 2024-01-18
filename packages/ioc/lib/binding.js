export class Binding {
    boundEntity;
    dependencies;
    scope;
    cache;
    activated;
    constructor() {
        this.boundEntity = null;
        this.dependencies = [];
        this.scope = 'Transient';
        this.cache = null;
        this.activated = false;
    }
}
