import React, { useState } from 'react';
import { Box, Text, Transform, useInput } from 'ink';
export default function Table({ data }) {
    const [selected, setSelected] = useState(0);
    useInput((_, key) => {
        if (key.upArrow) {
            if (selected > 0) {
                setSelected(value => value - 1);
            }
        }
        if (key.downArrow) {
            if (data && selected < data.length - 1) {
                setSelected(value => value + 1);
            }
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