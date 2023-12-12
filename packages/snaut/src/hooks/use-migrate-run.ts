import { useEffect, useState } from 'react';
import { useApp } from 'ink';
import { MigrationLoader } from 'ijon';

export default function useMigrateRun(loader: MigrationLoader): [boolean, string[]] {
  const { exit } = useApp();
  const [done, setDone] = useState(false);
  const [list, setList] = useState<string[]>([]);

  useEffect(() => {
    function pushMigration(migration: string) {
      setList(values => [...values, migration])
    }
    loader.on('up:success', pushMigration);
    return () => {
      loader.off('up:success', pushMigration);
    }
  }, []);

  useEffect(() => {
    loader.up().then(() => {
      setDone(true);
      loader.close().then(() => exit());
    });
  }, []);

  return [done, list];
}
