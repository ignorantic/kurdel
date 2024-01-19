import { useEffect, useState } from 'react';
import { useApp } from 'ink';
import { MigrationManager } from '@kurdel/migrations';
import useMigrationList, { ListItem } from './use-migration-list.js';

export default function useMigrateRollback(manager: MigrationManager): [ListItem[], boolean, string?] {
  const { exit } = useApp();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<TypeError>();
  const [list, addMigration] = useMigrationList();

  useEffect(() => {
    function pushSuccessMigration(migration: string) {
      addMigration(true, migration);
    }
    manager.on('down:success', pushSuccessMigration);
    return () => {
      manager.off('down:success', pushSuccessMigration);
    }
  }, []);

  useEffect(() => {
    function pushFailureMigration(migration: string, error: TypeError) {
      addMigration(false, migration);
      setError(error);
    }
    manager.on('down:failure', pushFailureMigration);
    return () => {
      manager.off('down:failure', pushFailureMigration);
    }
  }, []);

  useEffect(() => {
    manager.rollback().then(() => {
      setDone(true);
    }).catch((error) => {
      setError(error); 
    }).finally(() => {
      manager.close().then(() => exit());
    });
  }, []);

  return [list, done, error && error.message];
}
