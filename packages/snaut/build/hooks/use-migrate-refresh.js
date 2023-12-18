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
        function pushMigrationDown(migration) {
            addRollbackMigration(true, migration);
        }
        loader.on('down:success', pushMigrationDown);
        return () => {
            loader.off('down:success', pushMigrationDown);
        };
    }, []);
    useEffect(() => {
        function pushMigrationUp(migration) {
            addRunMigration(true, migration);
        }
        loader.on('up:success', pushMigrationUp);
        return () => {
            loader.off('up:success', pushMigrationUp);
        };
    }, []);
    useEffect(() => {
        function pushFailureMigrationDown(migration, error) {
            addRollbackMigration(false, migration);
            setError(error);
        }
        loader.on('down:failure', pushFailureMigrationDown);
        return () => {
            loader.off('down:failure', pushFailureMigrationDown);
        };
    }, []);
    useEffect(() => {
        function pushFailureMigrationUp(migration, error) {
            addRunMigration(false, migration);
            setError(error);
        }
        loader.on('up:failure', pushFailureMigrationUp);
        return () => {
            loader.off('up:failure', pushFailureMigrationUp);
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