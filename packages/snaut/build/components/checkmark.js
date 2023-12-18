import React from 'react';
import { Text } from 'ink';
import Spinner from 'ink-spinner';
export default function Checkmark({ done, error = false }) {
    if (error) {
        return React.createElement(Text, { color: "red" }, '\u2717');
    }
    if (done) {
        return React.createElement(Text, { color: "green" }, '\u2713');
    }
    return React.createElement(Spinner, null);
}
//# sourceMappingURL=checkmark.js.map