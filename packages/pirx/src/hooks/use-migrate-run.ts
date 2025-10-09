import { useEffect, useState } from 'react';
import { useApp } from 'ink';
import type { MigrationManager } from '@kurdel/migrations';
import type { ListItem } from './use-migration-list.js';
import useMigrationList from './use-migration-list.js';

export default function useMigrateRun(manager: MigrationManager): [ListItem[], boolean, string?] {
  const { exit } = useApp();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<TypeError>();
  const [list, addMigration] = useMigrationList();

  useEffect(() => {
    function pushSuccessMigration(migration: string) {
      addMigration(true, migration);
    }
    manager.on('up:success', pushSuccessMigration);
    return () => {
      manager.off('up:success', pushSuccessMigration);
    };
  }, []);

  useEffect(() => {
    function pushFailureMigration(migration: string, error: TypeError) {
      addMigration(false, migration);
      setError(error);
    }
    manager.on('up:failure', pushFailureMigration);
    return () => {
      manager.off('up:failure', pushFailureMigration);
    };
  }, []);

  useEffect(() => {
    manager
      .run()
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
