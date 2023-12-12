import { useEffect, useState } from 'react';
import { useApp } from 'ink';
export default function useMigrateRollback(loader) {
    const { exit } = useApp();
    const [done, setDone] = useState(false);
    const [list, setList] = useState([]);
    useEffect(() => {
        function pushMigration(migration) {
            setList(values => [...values, migration]);
        }
        loader.on('down:success', pushMigration);
        return () => {
            loader.off('down:success', pushMigration);
        };
    }, []);
    useEffect(() => {
        loader.down().then(() => {
            setDone(true);
            loader.close().then(() => exit());
        });
    }, []);
    return [done, list];
}
//# sourceMappingURL=use-migrate-rollback.js.map