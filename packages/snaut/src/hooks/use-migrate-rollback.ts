import { useEffect, useState } from 'react';
import { useApp } from 'ink';
import { MigrationLoader } from 'ijon';

export default function useMigrateRollback(loader: MigrationLoader): [boolean, string[]] {
  const { exit } = useApp();
  const [done, setDone] = useState(false);
  const [list, setList] = useState<string[]>([]);

  useEffect(() => {
    function pushMigration(migration: string) {
      setList(values => [...values, migration])
    }
    loader.on('down:success', pushMigration);
    return () => {
      loader.off('down:success', pushMigration);
    }
  }, []);

  useEffect(() => {
    loader.down().then(() => {
      setDone(true);
      loader.close().then(() => exit());
    });
  }, []);

  return [done, list];
}
