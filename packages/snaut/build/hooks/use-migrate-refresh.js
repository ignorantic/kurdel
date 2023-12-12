import { useEffect, useState } from 'react';
import { useApp } from 'ink';
export default function useMigrateRefresh(loader) {
    const { exit } = useApp();
    const [rollbackDone, setRollbackDone] = useState(false);
    const [rollbackList, setRollbackList] = useState([]);
    const [runDone, setRunDone] = useState(false);
    const [runList, setRunList] = useState([]);
    useEffect(() => {
        function pushMigration(migration) {
            setRollbackList(values => [...values, migration]);
        }
        loader.on('down:success', pushMigration);
        return () => {
            loader.off('down:success', pushMigration);
        };
    }, []);
    useEffect(() => {
        loader.down().then(() => {
            setRollbackDone(true);
        });
    }, []);
    useEffect(() => {
        if (!rollbackDone) {
            return;
        }
        function pushMigration(migration) {
            setRunList(values => [...values, migration]);
        }
        loader.on('up:success', pushMigration);
        return () => {
            loader.off('up:success', pushMigration);
        };
    }, [rollbackDone]);
    useEffect(() => {
        if (!rollbackDone) {
            return;
        }
        loader.up().then(() => {
            setRunDone(true);
            loader.close().then(() => exit());
        });
    }, [rollbackDone]);
    return [rollbackDone, runDone, rollbackList, runList];
}
//# sourceMappingURL=use-migrate-refresh.js.map