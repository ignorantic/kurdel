import { useEffect, useState } from 'react';
import { useApp } from 'ink';
import { MigrationLoader } from 'ijon';
import useMigrationList, { ListItem } from './use-migration-list.js';

export default function useMigrateRefresh(loader: MigrationLoader): [ListItem[], ListItem[], boolean, string?] {
  const { exit } = useApp();

  const [done, setDone] = useState(false);
  const [error, setError] = useState<TypeError>();

  const [rollbackList, addRollbackMigration] = useMigrationList();
  const [runList, addRunMigration] = useMigrationList();

  useEffect(() => {
    function pushMigration(migration: string) {
      addRollbackMigration(true, migration)
    }
    loader.on('down:success', pushMigration);
    return () => {
      loader.off('down:success', pushMigration);
    }
  }, []);

  useEffect(() => {
    function pushMigration(migration: string) {
      addRunMigration(true, migration)
    }
    loader.on('up:success', pushMigration);
    return () => {
      loader.off('up:success', pushMigration);
    }
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
