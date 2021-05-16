class Page {
  constructor(moduleName) {
    this.moduleName = moduleName
    this.tabs = []
  }
  addTab(tabs) {
    this.tabs.push(tabs)
  }
}

Page.Tab = class {
  constructor(name, displayName) {
    this.name = name
    this.displayName = displayName
    this.widgets = []
  }
  addWidget(widgets) {
    this.widgets.push(widgets)
  }
}

Page.Widget = class {
  constructor(name, width, height, params) {
    this.name = name
    this.width = width || "100%"
    this.height = height || "200px"
    this.params = params || {}
  }
}

module.exports = Page
