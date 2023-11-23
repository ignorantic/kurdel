import React, { useEffect, useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import Spinner from 'ink-spinner';

type User = {
  id: number,
  name: string,
}

export default function Users() {
  const { exit } = useApp();
  const [users, setUsers] = useState<User[]>();
  const [selected, setSelected] = useState<number>(0);

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
    return (
      <Text>
        <Spinner type="dots" />
        {' Loading...'}
      </Text>
    );
  }

  return (
    <Box flexDirection="column" borderStyle="single">
      <Box borderStyle="classic" borderTop={false} borderRight={false} borderLeft={false}>
        <Box flexBasis="10%">
          <Text color="blue" bold>ID</Text>
        </Box>
        <Box>
          <Text color="blue" bold>Name</Text>
        </Box>
      </Box>
      {
        users.map((user, i) => {
          const isSelected = i === selected;
          return (
            <Box key={user.id}>
              <Box flexBasis="10%">
                <Text bold={isSelected} color={isSelected ? 'red' : 'white'}>{user.id}</Text>
              </Box>
              <Box>
                <Text bold={isSelected} color={isSelected ? 'red' : 'white'}>{user.name}</Text>
              </Box>
            </Box>
          );
        })
      }
    </Box>
  );
}
