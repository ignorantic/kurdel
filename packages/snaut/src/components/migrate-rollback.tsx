import React, { Fragment } from 'react';
import { Box, Text } from 'ink';
import { MigrationLoader } from 'ijon';
import CheckListMarker from './check-list-marker.js';
import useMigrateRollback from '../hooks/use-migrate-rollback.js';

type Props = { loader: MigrationLoader };

export default function MigrateRollback({ loader }: Props) {
  const [done, migrationList] = useMigrateRollback(loader);

  return (
    <Fragment>
      {migrationList.length > 0 && (
        <Text>
          <CheckListMarker done={done} />
          {' '}Rolled back migrations: {migrationList.length}
        </Text>
      )}
      <Box flexDirection="column" paddingLeft={2}>
        {migrationList.map(migrationName => (
          <Text color="grey" key={migrationName}>
            {migrationName}
          </Text>)
        )}
      </Box>
      {done && (
        <Text bold>
          <CheckListMarker done={done} />
          {' '}Completed successfully
        </Text>
      )}
    </Fragment>
  );
}

