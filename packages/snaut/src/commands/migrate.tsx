import React, { useEffect, useState } from 'react';
import { Text } from 'ink';
import Spinner from 'ink-spinner';
import zod from 'zod';
import { argument } from 'pastel';
import { DatabaseFactory, IDatabase, JSONLoader } from 'ijon';

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
  const [connection, setConnection] = useState<IDatabase>();
  const [records, setRecords] = useState();

  useEffect(() => {
    async function connectDB() {
      const loader = new JSONLoader();
      const dbConfig = loader.load('./db.config.json');
      const driver = DatabaseFactory.createDriver(dbConfig);
      await driver.connect();
      if (!driver.connection) {
        throw new Error('Database connection failed');
      }
      setConnection(driver.connection);
    }

    connectDB();
  }, []);

  useEffect(() => {
    if (!connection || args[0] !== 'run') {
      return;
    }

    async function getUsers() {
      if (!connection) {
        return;
      }

      const users = await connection.all({ sql: 'SELECT * FROM `users`;', params: [] });
      setRecords(users);
    }
    
    getUsers();
  }, [connection]);

  return (
    <Text>
      <Spinner type="dots" />
      {JSON.stringify(records)}
    </Text>
  );
}

