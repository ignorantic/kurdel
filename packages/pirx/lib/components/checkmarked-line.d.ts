import React from 'react';
type Props = {
    title: string;
    done: boolean;
    error?: boolean;
    bold?: boolean;
    color?: string;
};
export default function CheckmarkedLine(props: Props): React.JSX.Element;
export {};
