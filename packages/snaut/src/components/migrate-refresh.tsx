import React, { Fragment } from 'react';
import { MigrationManager } from '@kurdel/common';
import useMigrateRefresh from '../hooks/use-migrate-refresh.js';
import CheckmarkedLine from './checkmarked-line.js';
import MigrationList from './migration-list.js';

type Props = { manager: MigrationManager };

export default function MigrateRefresh({ manager }: Props) {
  const [
    rollbackMigrationList,
    runMigrationList,
    done,
    error,
] = useMigrateRefresh(manager);

  return (
    <Fragment>
      {rollbackMigrationList.length > 0 && (
        <CheckmarkedLine
          done={done}
          error={runMigrationList.length === 0 && !!error}
          title="Rolled back migrations:"
        />
      )}
      <MigrationList list={rollbackMigrationList} />
      {runMigrationList.length > 0 && (
        <CheckmarkedLine
          done={done}
          error={!!error}
          title="Applying migrations:"
        />
      )}
      <MigrationList list={runMigrationList} />
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

