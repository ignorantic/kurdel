import React from 'react';
import Layout from './layout.js';
export default function withLayout(WrappedComponent) {
    return (props) => (React.createElement(Layout, null,
        React.createElement(WrappedComponent, { ...props })));
}
//# sourceMappingURL=with-layout.js.map