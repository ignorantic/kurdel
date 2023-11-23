import React, { useEffect, useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import Spinner from 'ink-spinner';
export default function Users() {
    const { exit } = useApp();
    const [users, setUsers] = useState();
    const [selected, setSelected] = useState(0);
    useEffect(() => {
        async function fetchUsers() {
            const response = await fetch('http://localhost:3000/users');
            const result = await response.json();
            setUsers(result);
        }
        fetchUsers().catch(console.error);
    }, []);
    useInput((input, key) => {
        if (input === 'q') {
            exit();
        }
        if (key.upArrow) {
            if (selected > 0) {
                setSelected(value => value - 1);
            }
        }
        if (key.downArrow) {
            if (users && selected < users.length - 1) {
                setSelected(value => value + 1);
            }
        }
    });
    if (!users) {
        return (React.createElement(Text, null,
            React.createElement(Spinner, { type: "dots" }),
            ' Loading...'));
    }
    return (React.createElement(Box, { flexDirection: "column", borderStyle: "single" },
        React.createElement(Box, { borderStyle: "classic", borderTop: false, borderRight: false, borderLeft: false },
            React.createElement(Box, { flexBasis: "10%" },
                React.createElement(Text, { color: "blue", bold: true }, "ID")),
            React.createElement(Box, null,
                React.createElement(Text, { color: "blue", bold: true }, "Name"))),
        users.map((user, i) => {
            const isSelected = i === selected;
            return (React.createElement(Box, { key: user.id },
                React.createElement(Box, { flexBasis: "10%" },
                    React.createElement(Text, { bold: isSelected, color: isSelected ? 'red' : 'white' }, user.id)),
                React.createElement(Box, null,
                    React.createElement(Text, { bold: isSelected, color: isSelected ? 'red' : 'white' }, user.name))));
        })));
}
//# sourceMappingURL=users.js.map