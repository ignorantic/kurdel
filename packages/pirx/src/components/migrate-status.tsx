import React, { useEffect, useState } from 'react';
import type { MigrationManager, MigrationStatus } from '@kurdel/migrations';
import { Box, Text, useApp } from 'ink';

type Props = { manager: MigrationManager };

export default function MigrateStatus({ manager }: Props) {
  const { exit } = useApp();
  const [status, setStatus] = useState<MigrationStatus[]>([]);
  const [error, setError] = useState<string>();

  useEffect(() => {
    manager.status()
      .then(setStatus)
      .catch(reason => setError(reason instanceof Error ? reason.message : String(reason)))
      .finally(() => manager.close().then(() => exit()));
  }, []);

  return (
    <Box flexDirection="column">
      {status.map(migration => (
        <Text
          key={migration.name}
          color={migration.state === 'applied'
            ? 'green'
            : migration.state === 'pending' ? 'yellow' : 'red'}
        >
          {migration.state.padEnd(7)} {migration.name}
          {migration.batch === undefined ? '' : ` (batch ${migration.batch})`}
        </Text>
      ))}
      {error && <Text color="red">Failure with message: {error}</Text>}
    </Box>
  );
}
