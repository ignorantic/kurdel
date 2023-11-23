import React, { useState } from 'react';
import { Box, Text, Transform, useInput } from 'ink';
export default function Table({ data }) {
    const [selected, setSelected] = useState(null);
    useInput((_, key) => {
        if (key.upArrow) {
            if (selected === null || selected > 0) {
                setSelected(value => value === null ? 0 : value - 1);
            }
        }
        if (key.downArrow) {
            if (selected === null || data && selected < data.length - 1) {
                setSelected(value => value === null ? 0 : value + 1);
            }
        }
        if (key.escape) {
            setSelected(null);
        }
    });
    const columns = Object.keys(data[0]);
    const count = columns.length;
    return (React.createElement(Box, { flexDirection: "column", borderStyle: "single", height: data.length + 4 },
        React.createElement(Box, { borderStyle: "single", borderTop: false, borderRight: false, borderLeft: false }, columns.map((column) => (React.createElement(Box, { key: column, flexBasis: `${100 / count}%` },
            React.createElement(Text, { color: "blue", bold: true },
                React.createElement(Transform, { transform: output => output.toUpperCase() }, column)))))),
        data.map((row, i) => {
            const isSelected = i === selected;
            return (React.createElement(Box, { key: row.id }, columns.map((column) => (React.createElement(Box, { key: column, flexBasis: `${100 / count}%` },
                React.createElement(Text, { bold: isSelected, color: isSelected ? 'red' : 'white' }, row[column]))))));
        })));
}
//# sourceMappingURL=table.js.map