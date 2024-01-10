export type ListItem = {
    success: boolean;
    name: string;
};
type AddListItem = (success: boolean, name: string) => void;
export default function useMigrationList(): [ListItem[], AddListItem];
export {};
