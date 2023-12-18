import { useState } from 'react';

export type ListItem = {
  success: boolean;
  name: string;
}

type AddListItem = (success: boolean, name: string) => void;

export default function useMigrationList(): [ListItem[], AddListItem] {
  const [list, setList] = useState<ListItem[]>([]);

  function add(success: boolean, name: string) {
    setList(value => [...value, { success, name }])
  }

  return [list, add];
}
