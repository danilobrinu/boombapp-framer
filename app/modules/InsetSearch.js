// Load Fonts and Insert CSS to support placeholder
Framer.Utils.loadWebFont('Material Icons')
Framer.Utils.insertCSS(
  `[contenteditable=true]:empty:before { content: attr(placeholder); }`
)
// Custom Events
Framer.Events.InsetSearchOnFocus = 'InsetSearch.Focus'
Framer.Events.InsetSearchOnBlur = 'InsetSearch.Blur'
Framer.Events.InsetSearchOnInput = 'InsetSearch.Input'

export default class InsetSearch extends Layer {
  constructor(options) {
    super(options)

    this.value = this.value.bind(this)
    this.empty = this.empty.bind(this)
    this.clear = this.clear.bind(this)

    // Input
    const {
      padding = 0,
      fontFamily,
      fontWeight,
      fontSize = 32,
      lineHeight = 2,
      placeholder = ''
    } = options

    this._input = document.createElement('div')
    // Input - Attributes
    this._input.setAttribute('contenteditable', 'true')
    this._input.setAttribute('placeholder', placeholder)
    // Input - Styles
    this._input.display = 'block'
    this._input.style.width = '100%'
    this._input.style.height = '100%'
    this._input.style.color = 'inherit'
    this._input.style.font = 'inherit'
    this._input.style.fontFamily = fontFamily
    this._input.style.fontWeight = fontWeight
    this._input.style.fontSize = `${fontSize}px`
    this._input.style.lineHeight = lineHeight
    this._input.style.boxSizing = 'border-box'
    this._input.style.padding = padding
    this._input.style.outline = 0
    // Input - Custom Events
    this._input.addEventListener('focus', () => {
      this.emit(
        Events.InsetSearchOnFocus,
        this.value(),
        this
      )
    }, false)

    this._input.addEventListener('blur', () => {
      this.emit(
        Events.InsetSearchOnBlur,
        this.value(),
        this
      )
    }, false)

    this._input.addEventListener('input', () => {
      this._clearButton.style.visibility = this.empty() ? 'hidden' : 'visible'

      this.emit(
        Events.InsetSearchOnInput,
        this.value(),
        this._input
      )
    })

    // Clear Button
    this._clearButton = document.createElement('div')
    // Clear Button - Styles
    this._clearButton.style.position = 'absolute'
    this._clearButton.style.top = '0'
    this._clearButton.style.right = '0'
    this._clearButton.style.margin = '24px'
    this._clearButton.style.width = '48px'
    this._clearButton.style.height = '48px'
    this._clearButton.style.textIndent = '6px'
    this._clearButton.style.lineHeight = '60px'
    this._clearButton.style.borderRadius = '50%'
    this._clearButton.style.backgroundColor = '#d1d1d1'
    this._clearButton.style.fontSize = '16px'
    this._clearButton.style.color = '#333'
    this._clearButton.innerHTML = '<i class="material-icons">&#xE5CD;</i>'
    this._clearButton.style.visibility = 'hidden'
    this._clearButton.style.cursor = 'pointer'
    // Clear Button - Events
    this._clearButton.addEventListener('click', () => this.clear(), false)

    // Adding to a module
    this._element.appendChild(this._input)
    this._element.appendChild(this._clearButton)
  }

  value() {
    return this._input.textContent.trim()
  }

  empty() {
    return !this.value().length
  }

  clear() {
    this._input.textContent = ''
    this._clearButton.style.visibility = 'hidden'
  }
}
