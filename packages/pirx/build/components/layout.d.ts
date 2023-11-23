import React, { ComponentType, ReactNode } from 'react';
type Props = {
    children: ReactNode;
};
export declare function withLayout<T extends {}>(WrappedComponent: ComponentType<T>): (props: T) => React.JSX.Element;
export default function Layout({ children }: Props): React.JSX.Element;
export {};
