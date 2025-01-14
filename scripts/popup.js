class Popup {
  constructor(triggerElement) {
    this.$trigger = triggerElement;

    this._init();
    this._setPopupContent();
  }

  _init() {
    this._initiateStructure();
    this._initiateTemplateElement();
    this._bindEventListeners();
  }

  _initiateStructure() {
    this._createPopupElement();
    this._createPopupBackgroundElement();
  }

  _createPopupElement() {
    this.$popup = document.createElement("div");
    this.$popup.classList.add("popup");
    document.body.appendChild(this.$popup);

    this._createPopupClose();
    this._createPopupContentContainer();
  }

  _createPopupBackgroundElement() {
    this.$background = document.createElement("div");
    this.$background.classList.add("popup-background");
    document.body.appendChild(this.$background);
  }

  _createPopupClose() {
    this.$popupClose = document.createElement("div");
    this.$popupClose.classList.add("popup-close");
    this.$popupClose.innerHTML = "&times";
    this.$popup.appendChild(this.$popupClose);
  }

  _createPopupContentContainer() {
    this.$popupContentContainer = document.createElement("div");
    this.$popupContentContainer.classList.add("container");
    this.$popup.appendChild(this.$popupContentContainer);
  }

  _initiateTemplateElement() {
    this.$template = document.getElementById(this.$trigger.dataset.popupTarget || "");
    if (!this.$template) this._destroy();

    this.$content = this.$template.cloneNode(true);
    this.$content.id = "popup-" + this.$content.id;
  }

  _bindEventListeners() {
    this.$popupClose.addEventListener("click", () => this._destroy());
    this.$background.addEventListener("click", () => this._destroy());
  }

  _setPopupContent() {
    this.$popupContentContainer.appendChild(this.$content);
    if (this.$content.localName === "form") {
      this.$content.removeAttribute("data-template");
      const index = this.$trigger.getAttribute("data-index");
      if (index) {
        this.$content.setAttribute("data-index", index);
      }

      new CustomForm(this.$content);
    }
  }

  _destroy() {
    this.$popup.remove();
    this.$background.remove();
  }
}

// init
(function () {
  document.querySelectorAll("[data-popup][data-popup-target]").forEach((element) => element.addEventListener("click", () => new Popup(element)));
})();
