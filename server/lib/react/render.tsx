/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { Response } from 'express';
import { HTML } from '@client/components/HTML';
import { REACT_STREAMING_ABORT_TIMEOUT } from '@const/server';

//@ts-ignore
const cssPath = import.meta.env.DEV ? '/client/index.css' : '/';

export const render = (url: string, res: Response) => {
  const { pipe, abort } = renderToPipeableStream(
    <React.StrictMode>
      <HTML cssPath={cssPath} title={url} />
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
  }, REACT_STREAMING_ABORT_TIMEOUT);
};
