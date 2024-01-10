import { useState } from 'react';
export default function useMigrationList() {
    const [list, setList] = useState([]);
    function add(success, name) {
        setList(value => [...value, { success, name }]);
    }
    return [list, add];
}
//# sourceMappingURL=use-migration-list.js.map