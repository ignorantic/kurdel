import React, { useState } from 'react';
import { Box, Text, Transform, useInput } from 'ink';

type Props = {
  data: any[];
};

export default function Table({ data }: Props) {
  const [selected, setSelected] = useState<number | null>(null);

  useInput((_, key) => {
    if (key.upArrow) {
      if (selected === null || selected > 0) {
        setSelected(value => value === null ? 0 : value - 1);
      }
    }

    if (key.downArrow) {
      if (selected === null || data && selected < data.length - 1) {
        setSelected(value => value === null ? 0 : value + 1);
      }
    }

    if (key.escape) {
      setSelected(null);
    }
  });

  const columns = Object.keys(data[0]);
  const count = columns.length;

  return (
    <Box flexDirection="column" borderStyle="single" height={data.length + 4}>
      <Box borderStyle="single" borderTop={false} borderRight={false} borderLeft={false}>
        {
          columns.map((column) => (
            <Box key={column} flexBasis={`${100 / count}%`}>
              <Text color="blue" bold>
                <Transform transform={output => output.toUpperCase()}>
                  {column}
                </Transform>
              </Text>
            </Box>
          ))
        }
      </Box>
      {
        data.map((row, i) => {
          const isSelected = i === selected;
          return (
            <Box key={row.id}>
              {
                columns.map((column) => (
                  <Box key={column} flexBasis={`${100 / count}%`}>
                    <Text bold={isSelected} color={isSelected ? 'red' : 'white'}>{row[column]}</Text>
                  </Box>
                ))
              }
            </Box>
          );
        })
      }
    </Box>
  );
}
