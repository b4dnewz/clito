# clito

> Simple and well written command line applications helper

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url] [![Coverage percentage][coveralls-image]][coveralls-url] [![Project License][license-image]][license-url]

## What's a clito?

__Clito__, pronounced as in "clitoris", stands for __cli-tools__ and it's a well written command line application helper.
It will become your best friend when dealing with cli applications, once you start play with it you will like it more than any other tool. :smirk:

![southpark-chef](banner.jpg)

Oops.. move along children, you are holding up the line, let see some features now..

## Features

- Parses arguments respecting types
- Boolean defaults to false
- Support required options
- Support multiple option arguments
- Negates flags when using the `--no-` prefix
- Outputs version when `--version`
- Build help string from options when called with `--help`
- Customizable help usage and command examples

## Getting started

Install the module using your favourite package manager:

```
npm install clito
```

Load it in your application code and set it up:

```js
#!/usr/bin/env node

const clito = require('clito');
const cli = clito({
  usage: 'askme <question>',
  flags: {
    person: {
      alias: 'p',
      default: 'chef'
    }
  }
})

const {input, flags} = cli
if (flags.person === 'chef') {
  console.log('> You gotta find the clitoris children.');
}
```

Than run it with some input and options:

```
$ node ./index.js "How do you make a girl love you more than other people?"
> You gotta find the clitoris children.
```

---

## License

This package is under [MIT](LICENSE) license and its made with love by [Filippo Conti](https://b4dnewz.github.io/)


[npm-image]: https://badge.fury.io/js/clito.svg

[npm-url]: https://npmjs.org/package/clito

[travis-image]: https://travis-ci.org/b4dnewz/clito.svg?branch=master

[travis-url]: https://travis-ci.org/b4dnewz/clito

[coveralls-image]: https://coveralls.io/repos/b4dnewz/clito/badge.svg

[coveralls-url]: https://coveralls.io/r/b4dnewz/clito

[license-image]: https://img.shields.io/badge/license-MIT-blue.svg

[license-url]: https://github.com/b4dnewz/clito/blob/master/LICENSE
