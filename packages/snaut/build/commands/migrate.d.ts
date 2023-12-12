import React from 'react';
import zod from 'zod';
export declare const args: zod.ZodTuple<[zod.ZodEnum<["run", "rollback", "refresh"]>], null>;
type Props = {
    args: zod.infer<typeof args>;
};
export default function MigrateCommand({ args: [command] }: Props): React.JSX.Element;
export {};
