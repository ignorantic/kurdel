import React from 'react';
import { Box, Text } from 'ink';
export default function MigrationList({ list }) {
    return (React.createElement(Box, { flexDirection: "column", paddingLeft: 2 }, list.map(item => (React.createElement(Text, { color: item.success ? 'grey' : 'red', key: item.name }, item.name)))));
}
//# sourceMappingURL=migration-list.js.map