import React from 'react';
import { Text } from 'ink';
import Spinner from 'ink-spinner';

type Props = {
  done: boolean;
  error?: boolean;
}

export default function Checkmark({ done, error = false }: Props) {
  if (error) {
    return <Text color="red">{'\u2717'}</Text>;
  }
  if (done) {
    return <Text color="green">{'\u2713'}</Text>;
  }
  return <Spinner />;
}

