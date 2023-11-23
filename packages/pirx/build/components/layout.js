import React, { useEffect, useState } from 'react';
import { Box, useApp, useInput, useStdout } from 'ink';
const enterAltScreenCommand = '\x1b[?1049h';
const leaveAltScreenCommand = '\x1b[?1049l';
export function withLayout(WrappedComponent) {
    return (props) => (React.createElement(Layout, null,
        React.createElement(WrappedComponent, { ...props })));
}
export default function Layout({ children }) {
    const { exit } = useApp();
    const { stdout } = useStdout();
    const [size, setSize] = useState({
        columns: stdout.columns,
        rows: stdout.rows,
    });
    useInput((input) => {
        if (input === 'q') {
            exit();
        }
    });
    useEffect(() => {
        function onResize() {
            setSize({
                columns: stdout.columns,
                rows: stdout.rows,
            });
        }
        stdout.on('resize', onResize);
        stdout.write(enterAltScreenCommand);
        return () => {
            stdout.off('resize', onResize);
            stdout.write(leaveAltScreenCommand);
        };
    }, []);
    return (React.createElement(Box, { width: size.columns, height: size.rows }, children));
}
//# sourceMappingURL=layout.js.map