import React from 'react';
import { Text } from 'ink';
import Spinner from 'ink-spinner';

export default function CheckListMarker({ done }: { done: boolean }) {
  return done ? <Text color="green">{'\u2713'}</Text> : <Spinner />
}

