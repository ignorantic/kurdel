import React, { Fragment } from 'react';
import { MigrationLoader } from 'ijon';
import useMigrateRefresh from '../hooks/use-migrate-refresh.js';
import CheckmarkedLine from './checkmarked-line.js';
import MigrationList from './migration-list.js';

type Props = { loader: MigrationLoader };

export default function MigrateRefresh({ loader }: Props) {
  const [
    rollbackMigrationList,
    runMigrationList,
    done,
    error,
] = useMigrateRefresh(loader);

  return (
    <Fragment>
      {rollbackMigrationList.length > 0 && (
        <CheckmarkedLine title="Rolled back migrations:" done={done} />
      )}
      <MigrationList list={rollbackMigrationList} />
      {runMigrationList.length > 0 && (
        <CheckmarkedLine title="Applying migrations:" done={done} />
      )}
      <MigrationList list={runMigrationList} />
      {done && !error && (
        <CheckmarkedLine title="Completed successfully" done={done} />
      )}
      {error && (
        <CheckmarkedLine done={done} error={!!error} title="Failure with message:" />
      )}
    </Fragment>
  );
}

