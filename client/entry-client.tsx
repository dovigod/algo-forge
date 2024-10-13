import 'vite/modulepreload-polyfill';

import React from 'react';
import ReactDOM from 'react-dom/client';
import { HTML } from './components/HTML';

ReactDOM.hydrateRoot(
  document,
  <React.StrictMode>
    <HTML
      // @ts-expect-error injected values

      cssPath={window.cssPath}
    />
  </React.StrictMode>,
);
