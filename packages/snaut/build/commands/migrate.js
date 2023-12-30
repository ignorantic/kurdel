import React from 'react';
import zod from 'zod';
import { argument } from 'pastel';
import { Box, Text } from 'ink';
import MigrateRun from '../components/migrate-run.js';
import MigrateRollback from '../components/migrate-rollback.js';
import MigrateRefresh from '../components/migrate-refresh.js';
import Checkmark from '../components/checkmark.js';
import useMigrationManager from '../hooks/use-migration-manager.js';
export const args = zod.tuple([
    zod.enum(['run', 'rollback', 'refresh']).describe(argument({
        name: 'command',
        description: 'Command name',
    })),
]);
export default function MigrateCommand({ args: [command] }) {
    const manager = useMigrationManager();
    return (React.createElement(Box, { flexDirection: "column", paddingLeft: 2 },
        React.createElement(Box, { gap: 1 },
            React.createElement(Checkmark, { done: !!manager }),
            React.createElement(Text, null, "Connecting database")),
        !!manager && command === 'run' && React.createElement(MigrateRun, { manager: manager }),
        !!manager && command === 'rollback' && React.createElement(MigrateRollback, { manager: manager }),
        !!manager && command === 'refresh' && React.createElement(MigrateRefresh, { manager: manager })));
}
//# sourceMappingURL=migrate.js.map