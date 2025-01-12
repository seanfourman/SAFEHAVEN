class RenderData {
  constructor(source, containerElement) {
    this._source = source;
    this._containerElement = containerElement;
    this._init();
    this._fillData();
  }

  _init() {
    this.$fields = Array.from(this._containerElement.querySelectorAll("[data-render-field]"));
  }

  _fillData() {
    this.$fields.forEach((element) => {
      element.textContent = this._source[element.dataset.renderField];
    });
  }
}
