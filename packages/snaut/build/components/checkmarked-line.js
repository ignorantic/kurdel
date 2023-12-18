import React from 'react';
import { Box, Text } from 'ink';
import Checkmark from './checkmark.js';
export default function CheckmarkedLine(props) {
    const { title, done, error = false, bold = false, color = 'white', } = props;
    return (React.createElement(Box, { gap: 1 },
        React.createElement(Checkmark, { done: done, error: error }),
        React.createElement(Text, { bold: bold, color: color }, title)));
}
//# sourceMappingURL=checkmarked-line.js.map