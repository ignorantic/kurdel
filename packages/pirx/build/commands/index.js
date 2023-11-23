import React, { useEffect, useState } from 'react';
import { Text } from 'ink';
import Spinner from 'ink-spinner';
export default function Index() {
    const [result, setResult] = useState();
    useEffect(() => {
        async function fetchUser() {
            const response = await fetch('http://localhost:3000/');
            const { message } = await response.json();
            setResult(message);
        }
        fetchUser().catch(console.error);
    }, []);
    if (!result) {
        return (React.createElement(Text, null,
            React.createElement(Spinner, { type: "dots" }),
            ' Ping...'));
    }
    return React.createElement(Text, null, result);
}
//# sourceMappingURL=index.js.map