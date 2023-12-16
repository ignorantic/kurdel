import React, { Fragment } from 'react';
import useMigrateRefresh from '../hooks/use-migrate-refresh.js';
import CheckmarkedLine from './checkmarked-line.js';
import MigrationList from './migration-list.js';
export default function MigrateRefresh({ loader }) {
    const [rollbackMigrationList, runMigrationList, done, error,] = useMigrateRefresh(loader);
    return (React.createElement(Fragment, null,
        rollbackMigrationList.length > 0 && (React.createElement(CheckmarkedLine, { title: "Rolled back migrations:", done: done })),
        React.createElement(MigrationList, { list: rollbackMigrationList }),
        runMigrationList.length > 0 && (React.createElement(CheckmarkedLine, { title: "Applying migrations:", done: done })),
        React.createElement(MigrationList, { list: runMigrationList }),
        done && !error && (React.createElement(CheckmarkedLine, { title: "Completed successfully", done: done })),
        error && (React.createElement(CheckmarkedLine, { done: done, error: !!error, title: "Failure with message:" }))));
}
//# sourceMappingURL=migrate-refresh.js.map