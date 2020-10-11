import { css } from 'lit-element';

export const wcNameStyles = css`
  :host {
    display: block;
    --default-main-color: #ff7900;
  }
  .wc-name {
    background-color: inherit;
    color: var(--main-color, var(--default-main-color));
  }
`;
