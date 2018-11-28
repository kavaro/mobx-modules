const { autorun } = require('mobx');
const { modules, Module } = require('./index')

class Tracer {
  constructor(refs) {
    this.clear()
    this.refs = refs
    this.refIndex = 0
    this.errors = 0
    this.trace = this.trace.bind(this)
  }

  clear() {
    this.recorded = []
  }

  get() {
    return this.recorded
  }

  trace(value) {
    this.recorded.push(value)
  }

  next() {
    const ref = JSON.stringify(this.refs[this.refIndex])
    const actual = JSON.stringify(this.recorded)
    if (actual !== ref) {
      console.log(`\nTest ${this.refIndex}: ERROR\n  actual   : ${actual}\n  reference: ${ref}\n`)
      this.errors++ 
    } else {
      console.log(`Test ${this.refIndex}: OK`)
    }
    this.refIndex++
    this.clear()
  }
}

const tracer = new Tracer([
  ['m2 begin', 'm1 begin', 'm1 end', 'm2 end', 'Hello world.m2', 'm3 begin', 'm3 end', 'Hello world.m2.m3'],
  ['m1 begin', 'm1 end', 'm2 begin', 'm2 end', 'Hello Karl.m2', 'm3 begin', 'm3 end', 'Hello Karl.m2.m3']
])

modules.set('trace', { exports: tracer.trace })

const m1 = new Module('m1')
m1.code = `
const trace = require('trace')
trace('m1 begin')
module.exports = 'Hello world'
trace('m1 end')
`

const m2 = new Module('m2')
const code = `
const trace = require('trace')
trace('m2 begin')
const m1 = require('m1')
module.exports = m1 + '.m2'
trace('m2 end')
`
m2.set({code, src: Module.transform(code)})

const m3 = new Module('m3')
m3.code = `
const trace = require('trace')
trace('m3 begin')
const m2 = require('m2')
module.exports = m2 + '.m3'
trace('m3 end')
`

modules.register(m1, m2, m3)

autorun(() => {
  if (!tracer.errors) {
    tracer.trace(m2.exports)
    tracer.trace(m3.exports)
    tracer.next()    
  }
})

setTimeout(() => {
  m1.code = `
const trace = require('trace')
trace('m1 begin')
module.exports = 'Hello Karl'
trace('m1 end')
  `
}, 0)

