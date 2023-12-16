import { useEffect, useState } from 'react';
import { useApp } from 'ink';
import useMigrationList from './use-migration-list.js';
export default function useMigrateRollback(loader) {
    const { exit } = useApp();
    const [done, setDone] = useState(false);
    const [error, setError] = useState();
    const [list, addMigration] = useMigrationList();
    useEffect(() => {
        function pushSuccessMigration(migration) {
            addMigration(true, migration);
        }
        loader.on('down:success', pushSuccessMigration);
        return () => {
            loader.off('down:success', pushSuccessMigration);
        };
    }, []);
    useEffect(() => {
        function pushFailureMigration(migration) {
            addMigration(false, migration);
        }
        loader.on('down:failure', pushFailureMigration);
        return () => {
            loader.off('down:failure', pushFailureMigration);
        };
    }, []);
    useEffect(() => {
        loader.rollback().then(() => {
            setDone(true);
        }).catch((error) => {
            setError(error);
        }).finally(() => {
            loader.close().then(() => exit());
        });
    }, []);
    return [list, done, error && error.message];
}
//# sourceMappingURL=use-migrate-rollback.js.map