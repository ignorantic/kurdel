import React, { useEffect, useState } from 'react';
import { Text } from 'ink';
import Spinner from 'ink-spinner';

export default function Index() {
  const [result, setResult] = useState<string>();

  useEffect(() => {
    async function fetchUser() {
      const response = await fetch('http://localhost:3000/');
      const { message } = await response.json();
      setResult(message);
    }

    fetchUser().catch(console.error);
  }, []);

  if (!result) {
    return (
      <Text>
        <Spinner type="dots" />
        {' Ping...'}
      </Text>
    );
  }

  return <Text>{result}</Text>;
}
