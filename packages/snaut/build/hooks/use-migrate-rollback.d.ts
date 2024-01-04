import { MigrationManager } from '@kurdel/common';
import { ListItem } from './use-migration-list.js';
export default function useMigrateRollback(manager: MigrationManager): [ListItem[], boolean, string?];
