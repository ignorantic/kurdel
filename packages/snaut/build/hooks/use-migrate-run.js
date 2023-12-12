import { useEffect, useState } from 'react';
import { useApp } from 'ink';
export default function useMigrateRun(loader) {
    const { exit } = useApp();
    const [done, setDone] = useState(false);
    const [list, setList] = useState([]);
    useEffect(() => {
        function pushMigration(migration) {
            setList(values => [...values, migration]);
        }
        loader.on('up:success', pushMigration);
        return () => {
            loader.off('up:success', pushMigration);
        };
    }, []);
    useEffect(() => {
        loader.up().then(() => {
            setDone(true);
            loader.close().then(() => exit());
        });
    }, []);
    return [done, list];
}
//# sourceMappingURL=use-migrate-run.js.map