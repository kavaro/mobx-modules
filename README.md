# mobx-modules

reactive commonjs modules for browser and server. 
- Dynamically add/remove commonjs modules.
- Dynamically modify the source code of commonjs modules.

When the source code of a module is modified at runtime, then all modules that 
directly or indirectly dependend on that module will automatically re-evaluate.

**By carefull not to introduce security issues in your app through this module (uses: new Function)**

# Installation

Requires node version 8.12.0 or higher

```
yarn add mobx-modules
```

# Usage

A contrived example that illustrates usage

```
const {autorun} = require('mobx')
const mobxModules = require('./index')

const {modules, Module} = mobxModules

// register static modules
modules.set('React', {exports: require('react')})
modules.set('mobx-react', {exports: require('mobx-react')})

const theme = new Module('theme')
theme.code = `
  module.exports = {
    colors: {
      primary: 'red'
    }
  }
`

const Paragraph = new Module('Paragraph')
const code = `
  const React = require('React')
  const {observer} = require('mobx-react')
  const {colors} = require('theme')
  module.exports = observer(({text}) => <p style={{color: colors.primary}}>{text}</p>)
`
const src = Module.transform(code)
Paragraph.set({code, src})

// register dynamic modules
modules.register(theme, Paragraph)

autorun(() => {
  // print paragraph module
  console.log(modules.require('Paragraph'))
})

setTimeout(() => {
  // update code of theme module, all modules that directly or indirectly
  // depend on it will automnatically re-evaluate (causing autorun to execute)
  theme.code = `
    module.exports = {
      colors: {
        primary: 'blue'
      }
    }
  `
}, 1000)
```

# Api

## Create a dynamic module

```
const {Module} = 'mobx-modules'

const m = new Module('module name')
```

## Define the source code for a dynamic module

```
m.code = `
  const React = require('react')
  const {observer} = require('mobx-react')
  
  ...
`
```

This will transform the source code using buble

## Set the module source code and transformed source code of a dynamic module

Avoids the buble transform when initializing the module from a database

```
m.set({code: `source code for the module`, src: `transformed source code for the module`})
```

## Get the dynamic module source code and transformed source code

Store the source and the transformed source in a database

```
const {code, src} = m.get()
``` 

## Dynamic module getters

Utility getters

```
m.name // the the name of the module
m.code // get the source code
m.src // get the transformed source code
```

## Static and dynamic module getter

```
m.exports // retrieve what the module exports
```

## Register a dynamic module

Register a module so it can be required

```
const {modules} = require('mobx-modules')

const m1 = new Module('m1')
const m2 = new Module('m2')

modules.register(m1, m2) // multiple modules can be register with one call
```

## Register a static module

Register a static modules so it can be required by a dynamic module

```
modules.set('React', {exports: require('react')})
```

## Require a registered module from outside dynamic module source code

```
const {modules} = require('mobx-modules')

const m1Exports = modules.require('m1') // returns module.exports of m1 module
```

## Get a registered module from outside dynamic module source code

```
const {modules} = require('mobx-modules')

const m1 = modules.get('m1') // returns m1 module
```

## Modules is a observable.map that stores modules

Hence all observable.map methods can be used






