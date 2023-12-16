import { useEffect, useState } from 'react';
import { useApp } from 'ink';
import useMigrationList from './use-migration-list.js';
export default function useMigrateRun(loader) {
    const { exit } = useApp();
    const [done, setDone] = useState(false);
    const [error, setError] = useState();
    const [list, addMigration] = useMigrationList();
    useEffect(() => {
        function pushSuccessMigration(migration) {
            addMigration(true, migration);
        }
        loader.on('up:success', pushSuccessMigration);
        return () => {
            loader.off('up:success', pushSuccessMigration);
        };
    }, []);
    useEffect(() => {
        function pushFailureMigration(migration, error) {
            addMigration(false, migration);
            setError(error);
        }
        loader.on('up:failure', pushFailureMigration);
        return () => {
            loader.off('up:failure', pushFailureMigration);
        };
    }, []);
    useEffect(() => {
        loader.run().then(() => {
            setDone(true);
        }).catch((error) => {
            setError(error);
        }).finally(() => {
            loader.close().then(() => exit());
        });
    }, []);
    return [list, done, error && error.message];
}
//# sourceMappingURL=use-migrate-run.js.map