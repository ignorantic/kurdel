import { useEffect, useState } from 'react';
import { useApp } from 'ink';
import useMigrationList from './use-migration-list.js';
export default function useMigrateRollback(manager) {
    const { exit } = useApp();
    const [done, setDone] = useState(false);
    const [error, setError] = useState();
    const [list, addMigration] = useMigrationList();
    useEffect(() => {
        function pushSuccessMigration(migration) {
            addMigration(true, migration);
        }
        manager.on('down:success', pushSuccessMigration);
        return () => {
            manager.off('down:success', pushSuccessMigration);
        };
    }, []);
    useEffect(() => {
        function pushFailureMigration(migration, error) {
            addMigration(false, migration);
            setError(error);
        }
        manager.on('down:failure', pushFailureMigration);
        return () => {
            manager.off('down:failure', pushFailureMigration);
        };
    }, []);
    useEffect(() => {
        manager
            .rollback()
            .then(() => {
            setDone(true);
        })
            .catch(error => {
            setError(error);
        })
            .finally(() => {
            manager.close().then(() => exit());
        });
    }, []);
    return [list, done, error && error.message];
}
//# sourceMappingURL=use-migrate-rollback.js.map