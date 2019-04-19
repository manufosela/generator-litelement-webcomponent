import { LitElement, html, css } from 'lit-element';

/**
 * `qweqwe-zxczc`
 * QweqweZxczc
 *
 * @customElement
 * @polymer
 * @litElement
 * @demo demo/index.html
 */

 class QweqweZxczc extends LitElement {
  static get is() { return 'qweqwe-zxczc'; }

  static get properties() {
    return {
      property1: { type: String },
      property2: { type: Number }
    };
  }

  static get styles(){
    return css`
      :host {
        display: block;
      }
    `;
  }
  
  constructor() {
    super();
    this.property1 = 'Year';
    this.property2 = 2019;
  }

  render() {
    return html`
      <div class="container">
        <h2>${this.property1}</h2>
        <h3>${this.property2}</h3>
      </div>
    `;
  }
}

window.customElements.define(QweqweZxczc.is, QweqweZxczc);