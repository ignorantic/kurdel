import { MigrationLoader } from 'ijon';
import { ListItem } from './use-migration-list.js';
export default function useMigrateRun(loader: MigrationLoader): [ListItem[], boolean, string?];
