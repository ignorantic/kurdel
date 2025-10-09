import type { MigrationManager } from '@kurdel/migrations';
import type { ListItem } from './use-migration-list.js';
export default function useMigrateRefresh(manager: MigrationManager): [ListItem[], ListItem[], boolean, string?];
