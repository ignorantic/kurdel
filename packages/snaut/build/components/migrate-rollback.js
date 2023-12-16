import React, { Fragment } from 'react';
import useMigrateRollback from '../hooks/use-migrate-rollback.js';
import MigrationList from './migration-list.js';
import CheckmarkedLine from './checkmarked-line.js';
export default function MigrateRollback({ loader }) {
    const [migrationList, done, error] = useMigrateRollback(loader);
    return (React.createElement(Fragment, null,
        migrationList.length > 0 && (React.createElement(CheckmarkedLine, { done: done, error: !!error, title: "Rolled back migrations:" })),
        React.createElement(MigrationList, { list: migrationList }),
        done && !error && (React.createElement(CheckmarkedLine, { done: done, error: !!error, title: "Completed successfully" })),
        error && (React.createElement(CheckmarkedLine, { done: done, error: !!error, title: "Failure with message:" }))));
}
//# sourceMappingURL=migrate-rollback.js.map