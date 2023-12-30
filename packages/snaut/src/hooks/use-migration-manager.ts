import { useEffect, useState } from 'react';
import { MigrationManager } from 'ijon';

export default function useMigrationManager() {
  const [loader, setLoader] = useState<MigrationManager | null>(null);

  useEffect(() => {
    MigrationManager.create().then((ml) => {
      setLoader(ml);
    });
  }, []);

  return loader;
}

