import React, { Fragment } from 'react';
import { MigrationLoader } from 'ijon';
import useMigrateRun from '../hooks/use-migrate-run.js';
import MigrationList from './migration-list.js';
import CheckmarkedLine from './checkmarked-line.js';

type Props = { loader: MigrationLoader };

export default function MigrateRun({ loader }: Props) {
  const [migrationList, done, error] = useMigrateRun(loader);

  return (
    <Fragment>
      {migrationList.length > 0 && (
        <CheckmarkedLine done={done} error={!!error} title="Applying migrations:" />
      )}
      <MigrationList list={migrationList} />
      {done && !error && (
        <CheckmarkedLine done={done} error={!!error} title="Completed successfully" />
      )}
      {error && (
        <CheckmarkedLine done={done} error={!!error} title="Failure with message:" />
      )}
    </Fragment>
  );
}

