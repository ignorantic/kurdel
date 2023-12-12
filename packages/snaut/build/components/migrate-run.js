import React, { Fragment } from 'react';
import { Box, Text } from 'ink';
import CheckListMarker from './check-list-marker.js';
import useMigrateRun from '../hooks/use-migrate-run.js';
export default function MigrateRun({ loader }) {
    const [done, migrationList] = useMigrateRun(loader);
    return (React.createElement(Fragment, null,
        migrationList.length > 0 && (React.createElement(Text, null,
            React.createElement(CheckListMarker, { done: done }),
            ' ',
            "Applying migrations: ",
            migrationList.length)),
        React.createElement(Box, { flexDirection: "column", paddingLeft: 2 }, migrationList.map(migrationName => (React.createElement(Text, { color: "grey", key: migrationName }, migrationName)))),
        done && (React.createElement(Text, { bold: true },
            React.createElement(CheckListMarker, { done: done }),
            ' ',
            "Completed successfully"))));
}
//# sourceMappingURL=migrate-run.js.map