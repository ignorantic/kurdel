import { MigrationLoader } from 'ijon';
import { ListItem } from './use-migration-list.js';
export default function useMigrateRollback(loader: MigrationLoader): [ListItem[], boolean, string?];
