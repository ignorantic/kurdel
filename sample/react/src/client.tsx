import { hydrateRoot } from 'react-dom/client';

import Home from './views/home.js';
import User from './views/user.js';

/**
 * Minimal client-side hydration entry point.
 * The same components rendered on the server are rehydrated here.
 * In a real app, routing and data fetching can be dynamic.
 */
const path = window.location.pathname;

if (path.startsWith('/user')) {
  // Example: load initial user data (could come from server-injected JSON)
  const user = { id: '1', name: 'Ada Lovelace' };
  hydrateRoot(document.getElementById('root')!, <User user={user} />);
} else {
  hydrateRoot(
    document.getElementById('root')!,
    <Home title="Kurdel + React" message="Welcome to React-powered templates!" />,
  );
}
