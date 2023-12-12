import { useEffect, useState } from 'react';
import { useApp } from 'ink';
import { MigrationLoader } from 'ijon';

export default function useMigrateRefresh(loader: MigrationLoader): [boolean, boolean, string[], string[]] {
  const { exit } = useApp();

  const [rollbackDone, setRollbackDone] = useState(false);
  const [rollbackList, setRollbackList] = useState<string[]>([]);

  const [runDone, setRunDone] = useState(false);
  const [runList, setRunList] = useState<string[]>([]);

  useEffect(() => {
    function pushMigration(migration: string) {
      setRollbackList(values => [...values, migration])
    }
    loader.on('down:success', pushMigration);
    return () => {
      loader.off('down:success', pushMigration);
    }
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

    function pushMigration(migration: string) {
      setRunList(values => [...values, migration])
    }
    loader.on('up:success', pushMigration);
    return () => {
      loader.off('up:success', pushMigration);
    }
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
