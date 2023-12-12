import { useEffect, useState } from 'react';
import { MigrationLoader } from 'ijon';

export default function useMigrationLoader() {
  const [loader, setLoader] = useState<MigrationLoader | null>(null);

  useEffect(() => {
    MigrationLoader.create().then((ml) => {
      setLoader(ml);
    });
  }, []);

  return loader;
}

