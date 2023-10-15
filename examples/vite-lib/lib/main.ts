import './main.css'

const white = $theme('color.black')

const html = String.raw
document.querySelector<HTMLDivElement>('#app')!.innerHTML = html`
  <div class="test" style="color: ${white}">
    Hello Pinceau
  </div>
`
