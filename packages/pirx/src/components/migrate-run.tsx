import React, { Fragment } from 'react';
import { MigrationManager } from '@kurdel/common';
import useMigrateRun from '../hooks/use-migrate-run.js';
import MigrationList from './migration-list.js';
import CheckmarkedLine from './checkmarked-line.js';

type Props = { manager: MigrationManager };

export default function MigrateRun({ manager }: Props) {
  const [migrationList, done, error] = useMigrateRun(manager);

  return (
    <Fragment>
      {migrationList.length > 0 && (
        <CheckmarkedLine
          done={done}
          error={!!error}
          title="Applying migrations:"
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

