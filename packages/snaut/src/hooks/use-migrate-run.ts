import { useEffect, useState } from 'react';
import { useApp } from 'ink';
import { MigrationLoader } from 'ijon';
import useMigrationList, { ListItem } from './use-migration-list.js';

export default function useMigrateRun(loader: MigrationLoader): [ListItem[], boolean, string?] {
  const { exit } = useApp();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<TypeError>();
  const [list, addMigration] = useMigrationList();

  useEffect(() => {
    function pushSuccessMigration(migration: string) {
      addMigration(true, migration);
    }
    loader.on('up:success', pushSuccessMigration);
    return () => {
      loader.off('up:success', pushSuccessMigration);
    }
  }, []);

  useEffect(() => {
    function pushFailureMigration(migration: string, error: TypeError) {
      addMigration(false, migration);
      setError(error);
    }
    loader.on('up:failure', pushFailureMigration);
    return () => {
      loader.off('up:failure', pushFailureMigration);
    }
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
