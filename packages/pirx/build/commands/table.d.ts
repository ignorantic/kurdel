import React from 'react';
import zod from 'zod';
export declare const args: zod.ZodTuple<[zod.ZodString], null>;
type Props = {
    args: zod.infer<typeof args>;
};
declare const _default: (props: Props) => React.JSX.Element;
export default _default;
