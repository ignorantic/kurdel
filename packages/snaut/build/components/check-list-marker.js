import React from 'react';
import { Text } from 'ink';
import Spinner from 'ink-spinner';
export default function CheckListMarker({ done }) {
    return done ? React.createElement(Text, { color: "green" }, '\u2713') : React.createElement(Spinner, null);
}
//# sourceMappingURL=check-list-marker.js.map