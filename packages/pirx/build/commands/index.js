import React from 'react';
import { Text } from 'ink';
import zod from 'zod';
export const options = zod.object({
    name: zod.string().describe('Your name'),
});
export default function Index({ options }) {
    return React.createElement(Text, null,
        "Hello, ",
        options.name,
        "!");
}
//# sourceMappingURL=index.js.map