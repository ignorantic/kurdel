import { useEffect, useState } from 'react';
import { useApp } from 'ink';
import { MigrationLoader } from 'ijon';
import useMigrationList, { ListItem } from './use-migration-list.js';

export default function useMigrateRollback(loader: MigrationLoader): [ListItem[], boolean, string?] {
  const { exit } = useApp();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<TypeError>();
  const [list, addMigration] = useMigrationList();

  useEffect(() => {
    function pushSuccessMigration(migration: string) {
      addMigration(true, migration);
    }
    loader.on('down:success', pushSuccessMigration);
    return () => {
      loader.off('down:success', pushSuccessMigration);
    }
  }, []);

  useEffect(() => {
    function pushFailureMigration(migration: string) {
      addMigration(false, migration);
    }
    loader.on('down:failure', pushFailureMigration);
    return () => {
      loader.off('down:failure', pushFailureMigration);
    }
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
