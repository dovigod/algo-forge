/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { Response } from 'express';
import { HTML } from '@client/components/HTML';
import { REACT_STREAMING_ABORT_TIMEOUT } from '@const/server';

//@ts-ignore
const cssPath = import.meta.env.DEV ? '/dist/client/public/index.css' : '/';

export const render = (url: string, res: Response) => {
  /**
   * @TODO
   * create style sheetos to support CSS-In-JS (styled-components
   * 2024/10/20 - styled-components seems yet supporting react 18 apis.
   * especially, internleaveWithRenderStream (https://styled-components.com/docs/advanced#server-side-rendering), is not compatible with react 18 apis.
   *
   * releated pr below
   *
   * https://github.com/styled-components/styled-components/issues/3658 - issuing
   * https://github.com/styled-components/styled-components/pull/4213/commits - draft
   *
   * What can we do?
   *
   * 1. wait
   * 2. fork the repo, and update locally
   */

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
        console.log('ready');
        pipe(res);
      },
    },
  );

  setTimeout(() => {
    abort();
  }, REACT_STREAMING_ABORT_TIMEOUT);
};
