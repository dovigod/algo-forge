import 'vite/modulepreload-polyfill';
// import './public/index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HTML } from '../../components/HTML';
console.log('hydrated');
ReactDOM.hydrateRoot(
  document,
  <React.StrictMode>
    <HTML
      // @ts-expect-error injected values

      cssPath={window.cssPath}
    />
  </React.StrictMode>,
);
