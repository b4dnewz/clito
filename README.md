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
      type: 'string',
      alias: 'p',
      default: 'chef'
    }
  },
  examples: [
    'askme -p "ghandi" "Do you ever got angry?"'
  ]
})

const {input, flags} = cli
const [question] = input
if (!question || question === '') {
  console.error('You must ask a question first!');
  process.exit(1);
}

if (flags.person === 'chef') {
  console.log('> You gotta find the clitoris children.');
} else {
  // evaluate question and answer it
}
```

Than run it with some input and options:

```
$ node ./index.js "How do you make a girl love you more than other people?"
> You gotta find the clitoris children.
```

## Options

The module can accept various options to customize the behavior or help string output.

#### flags

Type: `Object`  
Required: `true`

An object of name paired flags that are going to be used as command options and parsed.

A flag itself it's an object than can take various properties to describe how the flag should be parsed and outputted in help message:

* __type__: The flag type that should be returned from parsing (_this field is required_)
* __alias__: An alias for the flag (_dashes are added automatically_)
* __description__: The flag description used in the help message
* __default__: The flag default value in case not specified
* __required__: Identify the flag as required, will throw an error if flag is missing
* __multiple__: specify that the flag accept multiple arguments and should be parsed as array

Example flag:

```js
{
  foo: {
    type: 'string',
    alias: 'f',
    description: 'A foo option',
    default: 'bar',
    required: false,
    multiple: false
  }
}
```

#### banner

Type: `String`  

Add a custom banner string to be printed on top of `--help` message.

#### usage

Type: `String`  
Default: `$ {pkg.name} <input>`

Set a custom usage string to be used in `--help` message.

#### examples

Type: `String, String[]`

Add custom command usage examples to be appended on bottom of `--help` message.

#### showVersion

Type: `Boolean`  
Default: `true`

Shows the command version when called with `--version`.

#### showHelp

Type: `Boolean`  
Default: `true`

Shows the built-in command help when called with `--help`.

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
