import { MigrationManager } from '@kurdel/migrations';
import { ListItem } from './use-migration-list.js';
export default function useMigrateRun(manager: MigrationManager): [ListItem[], boolean, string?];
