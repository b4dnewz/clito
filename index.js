'use strict';

const path = require('path');
const yargs = require('yargs-parser');
const indent = require('indent-string');
const readPkgUp = require('read-pkg-up');

// Prevent caching of this module so module.parent is always accurate
delete require.cache[__filename];
const parentDir = path.dirname(module.parent.filename);

module.exports = function(options) {
  options = {
    pkg: readPkgUp.sync({
			cwd: parentDir,
			normalize: false
		}).pkg || {},
    argv: process.argv.slice(2),
    ...options
  };

  // Default option values expected from yargs-parser
  const parserDefaults = {
    alias: {},
    array: [],
    boolean: [],
    default: {},
    string: [],
    number: [],
    configuration: {
      'short-option-groups': true,
      'camel-case-expansion': true,
      'boolean-negation': true,
      'duplicate-arguments-array': false,
      'flatten-duplicate-arrays': true
    }
  };

  // Prepare flags for reducing into parser options
  const flags = options.flags || {};
  const flagsArr = Object.keys(flags).map(function(key) {
    return [key, flags[key]];
  });

  // Return application name and version
  const getVersion = function() {
    const {name, version} =  options.pkg;
    const nameStr = (options.name || name) + ' ';
    const versionStr = `v${(options.version || version)}`;
    return nameStr + versionStr;
  };

  // Print application name and version
  const showVersion = function() {
    // eslint-disable-next-line
    console.log(getVersion());
    process.exit();
  };

  // Print command usage string and options help
  const showHelp = function() {
    const bannerStr = [
      getVersion(),
      options.description || options.pkg.description
    ].join('\n');
    const pkgName = options.name || options.pkg.name;
    const usage = options.usage || `$ ${pkgName} <input>`;
    const usageStr = ['Usage:', indent(usage, 2)].join('\n');
    const optsStr = flagsArr.map(f => {
      const [name, opts] = f;
      const {alias, description} = opts;
      let opt = [`--${name}`];
      alias && opt.push(`-${alias}`);
      return opt.join(', ') + '  ' + (description || '');
    }).join('\n');
    const optOut = ['Options:', indent(optsStr, 2)].join('\n');

    let out = [
      bannerStr,
      usageStr,
      optOut
    ];

    if (options.examples) {
      const examplesStr = (Array.isArray(options.examples) ?
        options.examples :
        [options.examples]).map(s => indent(s, 2)).join('\n');
      const exampleStr = [
        'Examples:',
        examplesStr
      ].join('\n');
      out.push(exampleStr);
    }

    out = out.join('\n\n');
    // eslint-disable-next-line
    console.log(indent(out, 2));
    process.exit();
  };

  // Prepare parser options from user config
  const parserOpts = flagsArr.reduce(function(obj, flag) {
    const [flagName, flagOptions] = flag;
    const {
      type,
      alias,
      multiple,
      default: defaultValue,
    } = flagOptions;

    if (multiple) {
      obj.array.push({
        key: flagName,
        [type]: true
      });
    } else {
      obj[type].push(flagName);
    }

    if (alias) {
      obj.alias[flagName] = [alias];
    }

    if (defaultValue || type === 'boolean') {
      obj.default[flagName] = defaultValue || false;
    }

    return obj;
  }, parserDefaults);

  // Parse and extract args
  const {_: input, ...args} = yargs(options.argv, parserOpts);

  // Print application version
  if (args.version) {
    showVersion();
  }

  // If --help has been passed as flag
  if (args.help) {
    showHelp();
  }

  // Check for required options
  flagsArr.forEach(function([flagName, flagOpts]) {
    if (flagOpts.required && typeof args[flagName] === 'undefined') {
      throw new Error(`Option "${flagName}" is required.`);
    }
  });

  return {
    input,
    flags: args
  };
};
