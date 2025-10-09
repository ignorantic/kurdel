import type { MigrationManager } from '@kurdel/migrations';
import type { ListItem } from './use-migration-list.js';
export default function useMigrateRollback(manager: MigrationManager): [ListItem[], boolean, string?];
