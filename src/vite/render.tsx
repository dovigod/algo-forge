import React from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { Response } from 'express';
import { HTML } from '@client/components/HTML';

const ABORT_DELAY = 10000;

export const render = (url: string, res: Response) => {
  console.log('rendering');
  const { pipe, abort } = renderToPipeableStream(
    <React.StrictMode>
      <HTML cssPath={''} title={'hello' + url} />
    </React.StrictMode>,
    {
      bootstrapScriptContent: `window.cssPath = ''`,
      bootstrapModules: undefined,

      onShellError() {
        res.status(500);
        res.set({ 'Content-Type': 'text/html' });
        res.send('<h1>Something went wrong</h1>');
      },

      onShellReady() {
        res.status(200);
        res.set({ 'Content-Type': 'text/html' });
        pipe(res);
      },
    },
  );

  setTimeout(() => {
    abort();
  }, ABORT_DELAY);
};
