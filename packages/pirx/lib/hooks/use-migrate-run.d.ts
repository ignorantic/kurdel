import type { MigrationManager } from '@kurdel/migrations';
import type { ListItem } from './use-migration-list.js';
export default function useMigrateRun(manager: MigrationManager): [ListItem[], boolean, string?];
