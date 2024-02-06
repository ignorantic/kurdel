import React from 'react';
import { Box, Text } from 'ink';
import Checkmark from './checkmark.js';

type Props = {
  title: string;
  done: boolean;
  error?: boolean;
  bold?: boolean;
  color?: string;
} 

export default function CheckmarkedLine(props: Props) {
  const {
    title,
    done,
    error = false,
    bold = false,
    color = 'white',
  } = props;
  return (
    <Box gap={1}>
      <Checkmark done={done} error={error} />
      <Text bold={bold} color={color}>{title}</Text>
    </Box>
  );
}

