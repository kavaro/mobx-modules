const { transform } = require('buble')
const assign = require('core-js/fn/object/assign')
const { observable, computed, decorate } = require('mobx');

const modules = observable.map()
modules.register = (...mods) => {
  mods.forEach(mod => modules.set(mod.name, mod))
}
modules.require = name => {
  const mod = modules.get(name)
  return mod.exports
}

exports.modules = modules

class Module {
  constructor(name) {
    this._name = name
    this._code = ''
    this._src = ''
  }

  static transform(code) {
    return transform(code, {
      objectAssign: '_poly.assign',
      transforms: {
        dangerousForOf: true,
        dangerousTaggedTemplateString: true
      }
    }).code
  }

  get name() {
    return this._name
  }

  get code() {
    return this._code
  }

  set code(code) {
    if (code !== this._code) {
      this._src = Module.transform(code)
      this._code = code
    }
  }

  get src() {
    return this._src
  }

  set({ code, src }) {
    if (code !== this._code) {
      this._code = code
    }
    if (src !== this._src) {
      this._src = src
    }
  }

  get() {
    return {code: this._code, src: this._src}
  }

  get exports() {
    const mod = { exports: {} }
    const fn = new Function('_poly', 'module', 'exports', 'require', '__filename', '__dirname', this._src)
    fn({ assign }, mod, mod.exports, modules.require, 'index.js', this.name)
    return mod.exports
  }
}

decorate(Module, {
  _code: observable,
  _src: observable,
  exports: computed
})

exports.Module = Module

