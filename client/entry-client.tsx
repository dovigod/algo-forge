import 'vite/modulepreload-polyfill';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { HTML } from './components/HTML';

ReactDOM.hydrateRoot(
  document,
  <React.StrictMode>
    <HTML
      //@ts-expect-error injected on request
      cssPath={window._algoForgeManifest.cssPath}
      //@ts-expect-error injected on request
      title={window._algoForgeManifest.title}
    />
  </React.StrictMode>,
);
