import React from 'react';
import { Box, Text } from 'ink';
import { ListItem } from '../hooks/use-migration-list.js';

type Props = {
  list: ListItem[];
} 

export default function MigrationList({ list }: Props) {
  return (
    <Box flexDirection="column" paddingLeft={2}>
      {list.map(item => (
        <Text color={item.success ? 'grey' : 'red'} key={item.name}>
          {item.name}
        </Text>)
      )}
    </Box>
  );
}

