import React, { ComponentType, ReactNode, useEffect, useState } from 'react';
import { Box, useApp, useInput, useStdout } from 'ink';

const enterAltScreenCommand = '\x1b[?1049h';
const leaveAltScreenCommand = '\x1b[?1049l';

type Props = {
  children: ReactNode,
}

export function withLayout<T extends {}>(WrappedComponent: ComponentType<T>) {
  return (props: T) => (
    <Layout>
      <WrappedComponent {...(props as T)} />
    </Layout>
  )
}

export default function Layout({ children }: Props) {
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

  return (
    <Box width={size.columns} height={size.rows}>
      {children}
    </Box>
  );
}
