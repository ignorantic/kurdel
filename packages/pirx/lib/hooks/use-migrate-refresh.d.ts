import { MigrationManager } from '@kurdel/migrations';
import { ListItem } from './use-migration-list.js';
export default function useMigrateRefresh(manager: MigrationManager): [ListItem[], ListItem[], boolean, string?];
