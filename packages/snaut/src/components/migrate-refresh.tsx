import React, { Fragment } from 'react';
import { Box, Text } from 'ink';
import { MigrationLoader } from 'ijon';
import CheckListMarker from './check-list-marker.js';
import useMigrateRefresh from '../hooks/use-migrate-refresh.js';

type Props = { loader: MigrationLoader };

export default function MigrateRefresh({ loader }: Props) {
  const [
    rollbackDone,
    runDone,
    rollbackMigrationList,
    runMigrationList,
] = useMigrateRefresh(loader);

  return (
    <Fragment>
      {rollbackMigrationList.length > 0 && (
        <Text>
          <CheckListMarker done={rollbackDone} />
          {' '}Rolled back migrations: {rollbackMigrationList.length}
        </Text>
      )}
      <Box flexDirection="column" paddingLeft={2}>
        {rollbackMigrationList.map(migrationName => (
          <Text color="grey" key={migrationName}>
            {migrationName}
          </Text>)
        )}
      </Box>
      {rollbackDone && runMigrationList.length > 0 && (
        <Text>
          <CheckListMarker done={runDone} />
          {' '}Applying migrations: {runMigrationList.length}
        </Text>
      )}
      {rollbackDone && (
        <Box flexDirection="column" paddingLeft={2}>
          {runMigrationList.map(migrationName => (
            <Text color="grey" key={migrationName}>
              {migrationName}
            </Text>)
          )}
        </Box>
      )}
      {runDone && (
        <Text bold>
          <CheckListMarker done={runDone} />
          {' '}Completed successfully
        </Text>
      )}
    </Fragment>
  );
}

