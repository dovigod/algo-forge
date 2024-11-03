import { App } from '@client/App';

// import { SampleButton } from './SampleButton';
export const HTML = ({
  title,
  cssPath,
  styleSheets,
}: {
  title?: string;
  cssPath: string;
  styleSheets?: any;
}) => {
  return (
    <html lang="ko">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/svg+xml" href="/client/favicon.ico" />
        <link rel="stylesheet" href={cssPath} />

        <title>{title}</title>
        <meta name="description" content={'heelo'} />

        <meta property="og:title" content={title} />
        <meta property="og:type" content="website" />
        {/* @TODO */}
        {/* <meta property="og:image" content={page.src} /> */}
        {/* <meta property="og:description" content={description} /> */}
        {/* <meta property="og:site_name" content="" /> */}
        {styleSheets}
      </head>
      <body className="bg-white dark:bg-black">
        hello world
        {/* <SampleButton /> */}
        <App />
      </body>
      <script
        type="module"
        dangerouslySetInnerHTML={{
          __html: `import RefreshRuntime from 'http://localhost:3001/@react-refresh';
RefreshRuntime.injectIntoGlobalHook(window);
window.$RefreshReg$ = () => {};
window.$RefreshSig$ = () => (type) => type;
window.__vite_plugin_react_preamble_installed__ = true;`,
        }}
      />
      <script type="module" src="http://localhost:3001/@vite/client" defer />
      <script
        type="module"
        defer
        src="http://localhost:3001/client/entry/entry-client.tsx"
      />
    </html>
  );
};
