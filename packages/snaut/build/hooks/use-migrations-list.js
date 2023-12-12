import { useEffect, useState } from 'react';
export default function useMigrationsList(loader, eventName) {
    const [list, setList] = useState([]);
    useEffect(() => {
        loader.on(eventName, (migrationName) => {
            setList(values => [...values, migrationName]);
        });
    }, []);
    return list;
}
//# sourceMappingURL=use-migrations-list.js.map