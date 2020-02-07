/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import Icon from '@mdi/react';
import React from 'react';
import dribbble from 'simple-icons/icons/dribbble';
import github from 'simple-icons/icons/github';
import keybase from 'simple-icons/icons/keybase';
import medium from 'simple-icons/icons/medium';

const media = [
  {
    path: github.path,
    href: 'https://github.com/ovyerus'
  },
  {
    path: dribbble.path,
    href: 'https://dribbble.com/ovyerus'
  },
  {
    path: keybase.path,
    href: 'https://keybase.io/ovyerus'
  },
  {
    path: medium.path,
    href: 'https://medium.com/@ovyerus'
  }
];

const Footer: React.FC = () => (
  <footer
    css={css`
      padding: 24px;
      position: absolute;
      bottom: 0;
      width: 100%;
    `}
  >
    <ul
      css={css`
        list-style: none;
        display: flex;
        padding: 0;
        margin: 0;

        & > li {
          margin-right: 24px;
        }
      `}
    >
      {media.map(({ href, path }) => (
        <li key={href}>
          <a href={href}>
            <Icon color="var(--fg)" path={path} size={1.5} />
          </a>
        </li>
      ))}
    </ul>
  </footer>
);

export const Layout: React.FC<{ mainPage?: boolean }> = ({
  mainPage,
  children
}) => (
  <>
    <main
      css={css`
        flex: 1;
        display: flex;
        flex-direction: column;
        ${mainPage &&
          css`
            justify-content: center;
          `};
        margin: 4rem;
      `}
    >
      {children}
    </main>

    {mainPage && <Footer />}
  </>
);