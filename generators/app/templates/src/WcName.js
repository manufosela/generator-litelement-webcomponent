import { LitElement, html } from "lit-element";
import { wcNameStyles } from "./wc-name-style";

/**
 * `wc-name`
 * WcName
 *
 * @customElement wc-name
 * @litElement
 * @demo demo/index.html
 */

export class WcName extends LitElement {
  static get is() {
    return "wc-name";
  }

  static get properties() {
    return {
      /**
       * Example of property
       * @property
       * @type { String }
       */
      property1: { type: String },
      /**
       * Example of property
       * @property
       * @type { Number }
       */
      property2: { type: Number }
    };
  }

  static get styles() {
    return [wcNameStyles];
  }

  constructor() {
    super();
    this.property1 = "Year";
    this.property2 = new Date().getFullYear();
  }  

  render() {
    return html`
      <div class="wc-name">
        <h2>${this.property1}</h2>
        <h3>${this.property2}</h3>
      </div>
    `;
  }
}