import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import './my-another-element'
import './my-collision-element'

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-element')
export class MyElement extends LitElement {
  static styles = css`
    :host {
      display: block;
      border: solid 1px gray;
      padding: 16px;
      max-width: 800px;
    }
  `

  /**
   * The name to say "Hello" to.
   */
  @property()
    name = 'World'

  /**
   * The number of times the button has been clicked.
   */
  @property({ type: Number })
    count = 0

  /**
   * The name to say "Hello" to.
   */
  @property()
    span = false

  render() {
    return html`
      <div>
        <span></span>
        <h1>Hello, ${this.name}!</h1>
        <br />
        ${this.span ? html` <div>BG Color should change</div>` : html` <div>BG Color should change</div>`}
        <br />
        <br />
        <button part="button">
          prefligths: shadow-2xl
        </button>
        <br />
        <br />
        <button @click=${this._onClick} part="button">
          Click Count: ${this.count}
        </button>
        <button @click=${this._toggleSpan} part="button">
          Change BG Color:: ${this.span ? 'Normal' : 'Red'}
        </button>
        <my-another-element>Testing css part</my-another-element>
        <my-another-element>Testing css part</my-another-element>
        <my-another-element>Testing css part</my-another-element>
        <my-another-element>Testing css part</my-another-element>
        <my-another-element>Testing css part</my-another-element>
        <my-another-element>Testing css part</my-another-element>
        <my-another-element>Testing css part</my-another-element>
        <my-collision-element>Testing css part</my-collision-element>
        <my-collision-element>Testing css part</my-collision-element>
        <slot></slot>
      </div>
    `
  }

  private _onClick() {
    this.count++
  }

  private _toggleSpan() {
    this.span = !this.span
  }

  foo(): string {
    return 'foo'
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'my-element': MyElement
  }
}
