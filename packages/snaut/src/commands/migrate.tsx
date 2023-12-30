import React from 'react';
import zod from 'zod';
import { argument } from 'pastel';
import { Box, Text } from 'ink';
import MigrateRun from '../components/migrate-run.js';
import MigrateRollback from '../components/migrate-rollback.js';
import MigrateRefresh from '../components/migrate-refresh.js';
import Checkmark from '../components/checkmark.js';
import useMigrationManager from '../hooks/use-migration-manager.js';

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

export default function MigrateCommand({ args: [command] }: Props) {
  const manager = useMigrationManager();

  return (
    <Box flexDirection="column" paddingLeft={2}>
      <Box gap={1}>
        <Checkmark done={!!manager} />
        <Text>Connecting database</Text>
      </Box>
      {!!manager && command === 'run' && <MigrateRun manager={manager}/>}
      {!!manager && command === 'rollback' && <MigrateRollback manager={manager}/>}
      {!!manager && command === 'refresh' && <MigrateRefresh manager={manager}/>}
    </Box>
  );
}

