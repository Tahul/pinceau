const template = document.createElement('template')
template.innerHTML = `
<style>
</style>
<div>
  <button><slot></slot></button>
  <div part="cool-part">Testing part</div>
  <div part="another-cool-part">Testing another part</div>
</div>
`

export class MyAnotherElement extends HTMLElement {
  _clicked = false

  connectedCallback() {
    this.attachShadow({ mode: 'open' })
    this.shadowRoot?.appendChild(template.content.cloneNode(true))
    const button = this.shadowRoot?.querySelector('button')
    button?.addEventListener('click', this._handleClick.bind(this))
  }

  _handleClick() {
    this._clicked = !this._clicked
    const button = this.shadowRoot?.querySelector('button')
    if (this._clicked) {
      button?.classList?.remove('test')
      button?.classList?.add('test2')
    }
    else {
      button?.classList?.remove('test2')
      button?.classList?.add('test')
    }
  }
}
window.customElements.define('my-another-element', MyAnotherElement)
