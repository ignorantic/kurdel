import React, { useEffect } from 'react';
import { Text, useApp } from 'ink';
import zod from 'zod';
import { argument } from 'pastel';
import { MigrationsLoader } from 'ijon';

export const args = zod.tuple([
  zod.enum(['run', 'rollback', 'refresh']).describe(
    argument({
      name: 'command',
      description: 'Command name',
    }),
  ),
]);

type Props = {
  args: zod.infer<typeof args>;
};

export default function TableCommand({ args }: Props) {
  const { exit } = useApp();

  useEffect(() => {
    async function connectDB() {
      const migrationsLoader = await MigrationsLoader.create();
      if (args[0] === 'run') {
        await migrationsLoader.up();
        exit();
      }
      if (args[0] === 'rollback') {
        await migrationsLoader.down();
        exit();
      }
    }

    connectDB();
  }, []);

  return <Text>Loading...</Text>;
}
  
