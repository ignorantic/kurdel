import React from 'react';
import zod from 'zod';
import { argument } from 'pastel';
import { Box, Text } from 'ink';
import MigrateRun from '../components/migrate-run.js';
import MigrateRollback from '../components/migrate-rollback.js';
import MigrateRefresh from '../components/migrate-refresh.js';
import CheckListMarker from '../components/check-list-marker.js';
import useMigrationLoader from '../hooks/use-migration-loader.js';
export const args = zod.tuple([
    zod.enum(['run', 'rollback', 'refresh']).describe(argument({
        name: 'command',
        description: 'Command name',
    })),
]);
export default function MigrateCommand({ args: [command] }) {
    const loader = useMigrationLoader();
    return (React.createElement(Box, { flexDirection: "column", paddingLeft: 2 },
        React.createElement(Text, null,
            React.createElement(CheckListMarker, { done: !!loader }),
            ' ',
            "Connecting database"),
        !!loader && command === 'run' && React.createElement(MigrateRun, { loader: loader }),
        !!loader && command === 'rollback' && React.createElement(MigrateRollback, { loader: loader }),
        !!loader && command === 'refresh' && React.createElement(MigrateRefresh, { loader: loader })));
}
//# sourceMappingURL=migrate.js.map