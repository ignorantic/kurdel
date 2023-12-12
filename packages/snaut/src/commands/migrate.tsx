import React from 'react';
import zod from 'zod';
import { argument } from 'pastel';
import { Box, Text } from 'ink';
import MigrateRun from '../components/migrate-run.js';
import MigrateRollback from '../components/migrate-rollback.js';
import MigrateRefresh from '../components/migrate-refresh.js';
import CheckListMarker from '../components/check-list-marker.js';
import useMigrationLoader from '../hooks/use-migration-loader.js';

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
  const loader = useMigrationLoader();

  return (
    <Box flexDirection="column" paddingLeft={2}>
      <Text>
        <CheckListMarker done={!!loader} />
        {' '}Connecting database
      </Text>
      {!!loader && command === 'run' && <MigrateRun loader={loader}/>}
      {!!loader && command === 'rollback' && <MigrateRollback loader={loader}/>}
      {!!loader && command === 'refresh' && <MigrateRefresh loader={loader}/>}
    </Box>
  );
}

