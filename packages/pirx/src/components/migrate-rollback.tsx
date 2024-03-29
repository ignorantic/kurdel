import React, { Fragment } from 'react';
import { MigrationManager } from '@kurdel/migrations';
import useMigrateRollback from '../hooks/use-migrate-rollback.js';
import MigrationList from './migration-list.js';
import CheckmarkedLine from './checkmarked-line.js';

type Props = { manager: MigrationManager };

export default function MigrateRollback({ manager }: Props) {
  const [migrationList, done, error] = useMigrateRollback(manager);

  return (
    <Fragment>
      {migrationList.length > 0 && (
        <CheckmarkedLine
          done={done}
          error={!!error}
          title="Rolled back migrations:"
        />
      )}
      <MigrationList list={migrationList} />
      {done && !error && (
        <CheckmarkedLine
          done={done}
          error={!!error}
          title="Completed successfully"
        />
      )}
      {error && (
        <CheckmarkedLine
          title={`Failure with message: ${error}`}
          done={done}
          error={!!error}
        />
      )}
    </Fragment>
  );
}

