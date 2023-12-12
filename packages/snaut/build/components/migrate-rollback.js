import React, { Fragment } from 'react';
import { Box, Text } from 'ink';
import CheckListMarker from './check-list-marker.js';
import useMigrateRollback from '../hooks/use-migrate-rollback.js';
export default function MigrateRollback({ loader }) {
    const [done, migrationList] = useMigrateRollback(loader);
    return (React.createElement(Fragment, null,
        migrationList.length > 0 && (React.createElement(Text, null,
            React.createElement(CheckListMarker, { done: done }),
            ' ',
            "Rolled back migrations: ",
            migrationList.length)),
        React.createElement(Box, { flexDirection: "column", paddingLeft: 2 }, migrationList.map(migrationName => (React.createElement(Text, { color: "grey", key: migrationName }, migrationName)))),
        done && (React.createElement(Text, { bold: true },
            React.createElement(CheckListMarker, { done: done }),
            ' ',
            "Completed successfully"))));
}
//# sourceMappingURL=migrate-rollback.js.map