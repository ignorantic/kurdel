import { useEffect, useState } from 'react';
import { MigrationManager } from '@kurdel/common';
export default function useMigrationManager() {
    const [loader, setLoader] = useState(null);
    useEffect(() => {
        MigrationManager.create().then((ml) => {
            setLoader(ml);
        });
    }, []);
    return loader;
}
//# sourceMappingURL=use-migration-manager.js.map