import React, { useEffect, useState } from 'react';
import { Text } from 'ink';
import Spinner from 'ink-spinner';
import zod from 'zod';
import { argument } from 'pastel';
import Table from '../components/table.js';
import { withLayout } from '../components/layout.js';
export const args = zod.tuple([
    zod.string().describe(argument({
        name: 'name',
        description: 'Table name',
    })),
]);
function TableCommand({ args }) {
    const [records, setRecords] = useState();
    const [error, setError] = useState();
    useEffect(() => {
        async function fetchRecords() {
            const url = `http://localhost:3000/${args[0]}`;
            const response = await fetch(url);
            if (response.ok) {
                const result = await response.json();
                setRecords(result);
            }
            else {
                const err = await response.text();
                setError(err);
            }
        }
        fetchRecords().catch((err) => {
            setError(JSON.stringify(err));
        });
    }, []);
    if (error) {
        return React.createElement(Text, null,
            "Error: ",
            error);
    }
    if (!records) {
        return (React.createElement(Text, null,
            React.createElement(Spinner, { type: "dots" }),
            ' Loading...'));
    }
    return React.createElement(Table, { data: records });
}
export default withLayout(TableCommand);
//# sourceMappingURL=table.js.map