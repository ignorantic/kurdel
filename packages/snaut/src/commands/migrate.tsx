import React, { useEffect, useState } from 'react';
import { Box, Text, useApp } from 'ink';
import zod from 'zod';
import { argument } from 'pastel';
import { MigrationsLoader } from 'ijon';
import Spinner from 'ink-spinner';

function CheckListMarker({ done }: { done: boolean }) {
  return done ? <Text color="green">{'\u2713'}</Text> : <Spinner />
}

export const args = zod.tuple([
  zod.enum(['run', 'rollback', 'refresh']).describe(
    argument({
      name: 'command',
      description: 'Command name',
    }),
  ),
]);

type Props = {
  args: zod.infer<typeof args>;
};

export default function TableCommand({ args }: Props) {
  const { exit } = useApp();
  const [connected, setConnected] = useState(false);
  const [applied, setApplied] = useState(0);
  const [rolledBack, setRolledBack] = useState(0);
  const [done, setDone] = useState(false);
  const [migrationList, setMigrationList] = useState<string[]>([]);

  useEffect(() => {
    MigrationsLoader.create().then((migrationsLoader) => {
      setConnected(true);
      migrationsLoader.on('up:success', (migrationName) => {
        setApplied(value => value + 1);
        setMigrationList(values => [...values, migrationName])
      });
      migrationsLoader.on('down:success', (migrationName) => {
        setRolledBack(value => value + 1);
        setMigrationList(values => [...values, migrationName])
      });
      migrationsLoader.on('done', () => {
        setDone(true);
      });
      if (args[0] === 'run') {
        migrationsLoader.up().then(() => exit());
      }
      if (args[0] === 'rollback') {
        migrationsLoader.down().then(() => exit());
      }
    });
  }, []);

  return (
    <Box flexDirection="column" paddingLeft={2}>
      <Text>
        <CheckListMarker done={connected} />
        {' '}Connecting database
      </Text>
      {applied > 0 && (
        <Text>
          <CheckListMarker done={done} />
          {' '}Applying migrations: {applied}
        </Text>
      )}
      {rolledBack > 0 && (
        <Text>
          <CheckListMarker done={done} />
          {' '}Rolled back migrations: {rolledBack}
        </Text>
      )}
      <Box flexDirection="column" paddingLeft={2}>
        {migrationList.map(migrationName => (
          <Text color="grey" key={migrationName}>
            {migrationName}
          </Text>)
        )}
      </Box>
    </Box>
  );
}

