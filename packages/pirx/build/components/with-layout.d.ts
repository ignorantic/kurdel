import React, { ComponentType } from 'react';
export default function withLayout<T extends {}>(WrappedComponent: ComponentType<T>): (props: T) => React.JSX.Element;
