import React, { Fragment } from 'react';
import { Box, Text } from 'ink';
import CheckListMarker from './check-list-marker.js';
import useMigrateRefresh from '../hooks/use-migrate-refresh.js';
export default function MigrateRefresh({ loader }) {
    const [rollbackDone, runDone, rollbackMigrationList, runMigrationList,] = useMigrateRefresh(loader);
    return (React.createElement(Fragment, null,
        rollbackMigrationList.length > 0 && (React.createElement(Text, null,
            React.createElement(CheckListMarker, { done: rollbackDone }),
            ' ',
            "Rolled back migrations: ",
            rollbackMigrationList.length)),
        React.createElement(Box, { flexDirection: "column", paddingLeft: 2 }, rollbackMigrationList.map(migrationName => (React.createElement(Text, { color: "grey", key: migrationName }, migrationName)))),
        rollbackDone && runMigrationList.length > 0 && (React.createElement(Text, null,
            React.createElement(CheckListMarker, { done: runDone }),
            ' ',
            "Applying migrations: ",
            runMigrationList.length)),
        rollbackDone && (React.createElement(Box, { flexDirection: "column", paddingLeft: 2 }, runMigrationList.map(migrationName => (React.createElement(Text, { color: "grey", key: migrationName }, migrationName))))),
        runDone && (React.createElement(Text, { bold: true },
            React.createElement(CheckListMarker, { done: runDone }),
            ' ',
            "Completed successfully"))));
}
//# sourceMappingURL=migrate-refresh.js.map