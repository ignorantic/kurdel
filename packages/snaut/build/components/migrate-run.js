import React, { Fragment } from 'react';
import useMigrateRun from '../hooks/use-migrate-run.js';
import MigrationList from './migration-list.js';
import CheckmarkedLine from './checkmarked-line.js';
export default function MigrateRun({ loader }) {
    const [migrationList, done, error] = useMigrateRun(loader);
    return (React.createElement(Fragment, null,
        migrationList.length > 0 && (React.createElement(CheckmarkedLine, { done: done, error: !!error, title: "Applying migrations:" })),
        React.createElement(MigrationList, { list: migrationList }),
        done && !error && (React.createElement(CheckmarkedLine, { done: done, error: !!error, title: "Completed successfully" })),
        error && (React.createElement(CheckmarkedLine, { done: done, error: !!error, title: "Failure with message:" }))));
}
//# sourceMappingURL=migrate-run.js.map