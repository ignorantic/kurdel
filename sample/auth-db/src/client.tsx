import { hydrateRoot } from 'react-dom/client';

import './admin.css';
import Admin from './views/admin.js';

hydrateRoot(document.getElementById('root')!, <Admin />);
