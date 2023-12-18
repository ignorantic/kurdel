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
    function pushMigrationDown(migration: string) {
      addRollbackMigration(true, migration)
    }
    loader.on('down:success', pushMigrationDown);
    return () => {
      loader.off('down:success', pushMigrationDown);
    }
  }, []);

  useEffect(() => {
    function pushMigrationUp(migration: string) {
      addRunMigration(true, migration)
    }
    loader.on('up:success', pushMigrationUp);
    return () => {
      loader.off('up:success', pushMigrationUp);
    }
  }, []);

  useEffect(() => {
    function pushFailureMigrationDown(migration: string, error: TypeError) {
      addRollbackMigration(false, migration);
      setError(error);
    }
    loader.on('down:failure', pushFailureMigrationDown);
    return () => {
      loader.off('down:failure', pushFailureMigrationDown);
    }
  }, []);

  useEffect(() => {
    function pushFailureMigrationUp(migration: string, error: TypeError) {
      addRunMigration(false, migration);
      setError(error);
    }
    loader.on('up:failure', pushFailureMigrationUp);
    return () => {
      loader.off('up:failure', pushFailureMigrationUp);
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
