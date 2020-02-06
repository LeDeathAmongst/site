import { AppProps } from 'next/app';
import { css, Global } from '@emotion/core';

const App = ({ Component, pageProps }: AppProps) => (
  <>
    <Global
      styles={css`
        :root {
          color-scheme: light dark;
          --fonts: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
            Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          font-family: var(--fonts);
        }

        *,
        *::after,
        *::before {
          box-sizing: border-box !important;
        }

        body {
          background: var(--bg);
          color: var(--fg);
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          overflow: hidden;
        }

        #__next {
          flex: 1;
          display: flex;
        }
      `}
    />
    <Component {...pageProps} />
  </>
);

export default App;
