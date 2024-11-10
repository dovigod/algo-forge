/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import { renderToPipeableStream } from 'react-dom/server';
import { Response } from 'express';
import { HTML } from '@client/components/HTML';
import { REACT_STREAMING_ABORT_TIMEOUT } from '@const/server';
import {
  ServerStyleSheet,
  StyleSheetManager,
} from '@internal/styled-components';
import { Transform } from 'stream';
// import manifest from '../../../dist/client/.vite/manifest.json';

// inject manifest to solve hydration problem (mismatch between server rendered & client rendered)
const _algoForgeManifest = {
  cssPath: '/client/public/index.css',
  title: '',
};

// manifest['client/entry-client.tsx'];
const CLOSING_TAG_R = /^\s*<\/[a-z]/i;

const sheet = new ServerStyleSheet();

let html: any;
export function render(url: string, res: Response) {
  /**
   * @TODO
   * create style sheetos to support CSS-In-JS (styled-components
   * 2024/10/20 - styled-components seems yet supporting react 18 apis.
   * especially, internleaveWithRenderStream (https://styled-components.com/docs/advanced#server-side-rendering), is not compatible with react 18 apis.
   *
   * releated pr below
   *
   * https://github.com/styled-components/styled-components/pull/4213/commits - draft
   *
   * https://github.com/reactwg/react-18/discussions/110 - migration guide for Css-in-js
   */

  _algoForgeManifest.title = url;

  const styleComponentsPolyfillStream = new Transform({
    objectMode: true,
    transform: (chunk, _, cb) => {
      // Get the chunk and retrieve the sheet's CSS as an HTML chunk,
      // then reset its rules so we get only new ones for the next chunk
      const renderedHtml =
        chunk instanceof Uint8Array
          ? Buffer.from(chunk).toString()
          : chunk.toString();
      // get styles like <style>...</style>
      html = sheet._emitSheetCSS();

      //to get continuously only new rules, flush current style tags
      sheet.instance.clearTag();

      /**
       *
       * %style% -  style tag to inject
       * [ - start of chunck
       * ] - end of chunk
       *
       * case 1) - [ <xxx>awdaxxxx</xxx>....]
       *
       * case 2) - [ </x>....]
       *
       */
      // prepend style html to chunk, unless the start of the chunk is a closing tag
      if (CLOSING_TAG_R.test(renderedHtml)) {
        const endOfClosingTag = renderedHtml.indexOf('>') + 1;
        const before = renderedHtml.slice(0, endOfClosingTag);
        const after = renderedHtml.slice(endOfClosingTag);
        styleComponentsPolyfillStream.push(before + html + after);
      } else {
        styleComponentsPolyfillStream.push(renderedHtml);
      }
      cb();
    },
  });

  const renderStream = renderToPipeableStream(
    <StyleSheetManager sheet={sheet.instance}>
      <React.StrictMode>
        <HTML cssPath={_algoForgeManifest.cssPath} title={url} />
      </React.StrictMode>
    </StyleSheetManager>,
    {
      // safe cuz manifest is not injected but genereated
      bootstrapScriptContent: `window._algoForgeManifest = ${JSON.stringify(_algoForgeManifest)}`,
      bootstrapModules: undefined,
      bootstrapScripts: [], //update to use manifest on production

      onShellError() {
        res.status(500);
        res.set({ 'Content-Type': 'text/html' });
        res.send('<h1>Something went wrong</h1>');
      },

      onShellReady() {
        res.status(200);
        res.set({ 'Content-Type': 'text/html' });
        // pipe(res);
        // if (html) {
        //   duplex.write(html[0]); //Document start
        // }
        // renderStream.pipe(styleComponentsPolyfillStream);

        renderStream.pipe(styleComponentsPolyfillStream.pipe(res));
      },
      onAllReady() {
        // duplex.write(html[1]); //Document end
        // styleComponentsPolyfillStream.push(null);
      },
    },
  );

  setTimeout(() => {
    renderStream.abort();
  }, REACT_STREAMING_ABORT_TIMEOUT);
}
