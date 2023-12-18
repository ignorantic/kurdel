import React, { Fragment } from 'react';
import useMigrateRefresh from '../hooks/use-migrate-refresh.js';
import CheckmarkedLine from './checkmarked-line.js';
import MigrationList from './migration-list.js';
export default function MigrateRefresh({ loader }) {
    const [rollbackMigrationList, runMigrationList, done, error,] = useMigrateRefresh(loader);
    return (React.createElement(Fragment, null,
        rollbackMigrationList.length > 0 && (React.createElement(CheckmarkedLine, { done: done, error: runMigrationList.length === 0 && !!error, title: "Rolled back migrations:" })),
        React.createElement(MigrationList, { list: rollbackMigrationList }),
        runMigrationList.length > 0 && (React.createElement(CheckmarkedLine, { done: done, error: !!error, title: "Applying migrations:" })),
        React.createElement(MigrationList, { list: runMigrationList }),
        done && !error && (React.createElement(CheckmarkedLine, { done: done, error: !!error, title: "Completed successfully" })),
        error && (React.createElement(CheckmarkedLine, { title: `Failure with message: ${error}`, done: done, error: !!error }))));
}
//# sourceMappingURL=migrate-refresh.js.map