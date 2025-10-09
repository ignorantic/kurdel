import { useEffect, useState } from 'react';
import { useApp } from 'ink';
import type { MigrationManager } from '@kurdel/migrations';
import type { ListItem } from './use-migration-list.js';
import useMigrationList from './use-migration-list.js';

export default function useMigrateRefresh(
  manager: MigrationManager
): [ListItem[], ListItem[], boolean, string?] {
  const { exit } = useApp();

  const [done, setDone] = useState(false);
  const [error, setError] = useState<TypeError>();

  const [rollbackList, addRollbackMigration] = useMigrationList();
  const [runList, addRunMigration] = useMigrationList();

  useEffect(() => {
    function pushMigrationDown(migration: string) {
      addRollbackMigration(true, migration);
    }
    manager.on('down:success', pushMigrationDown);
    return () => {
      manager.off('down:success', pushMigrationDown);
    };
  }, []);

  useEffect(() => {
    function pushMigrationUp(migration: string) {
      addRunMigration(true, migration);
    }
    manager.on('up:success', pushMigrationUp);
    return () => {
      manager.off('up:success', pushMigrationUp);
    };
  }, []);

  useEffect(() => {
    function pushFailureMigrationDown(migration: string, error: TypeError) {
      addRollbackMigration(false, migration);
      setError(error);
    }
    manager.on('down:failure', pushFailureMigrationDown);
    return () => {
      manager.off('down:failure', pushFailureMigrationDown);
    };
  }, []);

  useEffect(() => {
    function pushFailureMigrationUp(migration: string, error: TypeError) {
      addRunMigration(false, migration);
      setError(error);
    }
    manager.on('up:failure', pushFailureMigrationUp);
    return () => {
      manager.off('up:failure', pushFailureMigrationUp);
    };
  }, []);

  useEffect(() => {
    manager
      .refresh()
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

  return [rollbackList, runList, done, error && error.message];
}
