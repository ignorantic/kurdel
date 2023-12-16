import { useEffect, useState } from 'react';
import { useApp } from 'ink';
import useMigrationList from './use-migration-list.js';
export default function useMigrateRefresh(loader) {
    const { exit } = useApp();
    const [done, setDone] = useState(false);
    const [error, setError] = useState();
    const [rollbackList, addRollbackMigration] = useMigrationList();
    const [runList, addRunMigration] = useMigrationList();
    useEffect(() => {
        function pushMigration(migration) {
            addRollbackMigration(true, migration);
        }
        loader.on('down:success', pushMigration);
        return () => {
            loader.off('down:success', pushMigration);
        };
    }, []);
    useEffect(() => {
        function pushMigration(migration) {
            addRunMigration(true, migration);
        }
        loader.on('up:success', pushMigration);
        return () => {
            loader.off('up:success', pushMigration);
        };
    }, []);
    useEffect(() => {
        loader.refresh().then(() => {
            setDone(true);
        }).catch((error) => {
            setError(error);
        }).finally(() => {
            loader.close().then(() => exit());
        });
    }, []);
    return [rollbackList, runList, done, error && error.message];
}
//# sourceMappingURL=use-migrate-refresh.js.map