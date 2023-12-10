import React, { useEffect, useState } from 'react';
import { Box, Text, useApp } from 'ink';
import zod from 'zod';
import { argument } from 'pastel';
import { MigrationsLoader } from 'ijon';
import Spinner from 'ink-spinner';
function CheckListMarker({ done }) {
    return done ? React.createElement(Text, { color: "green" }, '\u2713') : React.createElement(Spinner, null);
}
export const args = zod.tuple([
    zod.enum(['run', 'rollback', 'refresh']).describe(argument({
        name: 'command',
        description: 'Command name',
    })),
]);
export default function TableCommand({ args }) {
    const { exit } = useApp();
    const [connected, setConnected] = useState(false);
    const [applied, setApplied] = useState(0);
    const [rolledBack, setRolledBack] = useState(0);
    const [done, setDone] = useState(false);
    const [migrationList, setMigrationList] = useState([]);
    useEffect(() => {
        MigrationsLoader.create().then((migrationsLoader) => {
            setConnected(true);
            migrationsLoader.on('up:success', (migrationName) => {
                setApplied(value => value + 1);
                setMigrationList(values => [...values, migrationName]);
            });
            migrationsLoader.on('down:success', (migrationName) => {
                setRolledBack(value => value + 1);
                setMigrationList(values => [...values, migrationName]);
            });
            migrationsLoader.on('done', () => {
                setDone(true);
            });
            if (args[0] === 'run') {
                migrationsLoader.up().then(() => exit());
            }
            if (args[0] === 'rollback') {
                migrationsLoader.down().then(() => exit());
            }
        });
    }, []);
    return (React.createElement(Box, { flexDirection: "column", paddingLeft: 2 },
        React.createElement(Text, null,
            React.createElement(CheckListMarker, { done: connected }),
            ' ',
            "Connecting database"),
        applied > 0 && (React.createElement(Text, null,
            React.createElement(CheckListMarker, { done: done }),
            ' ',
            "Applying migrations: ",
            applied)),
        rolledBack > 0 && (React.createElement(Text, null,
            React.createElement(CheckListMarker, { done: done }),
            ' ',
            "Rolled back migrations: ",
            rolledBack)),
        React.createElement(Box, { flexDirection: "column", paddingLeft: 2 }, migrationList.map(migrationName => (React.createElement(Text, { color: "grey", key: migrationName }, migrationName))))));
}
//# sourceMappingURL=migrate.js.map