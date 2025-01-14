// data is a class that renders data in the DOM elements based on the data attributes of the elements
class RenderData {
  constructor(source, containerElement) {
    this._source = source;
    this._containerElement = containerElement;
    this._init();
    this._fillData();
  }

  // _init initializes the fields to be rendered
  _init() {
    this.$fields = Array.from(this._containerElement.querySelectorAll("[data-render-field]"));
  }

  // _fillData fills the DOM elements with the data from the source
  _fillData() {
    this.$fields.forEach((element) => {
      element.textContent = this._source[element.dataset.renderField];
    });
  }
}
