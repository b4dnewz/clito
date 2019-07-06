'use strict';

const path = require('path');
const yargs = require('yargs-parser');
const indent = require('indent-string');
const readPkgUp = require('read-pkg-up');

// Prevent caching of this module so module.parent is always accurate
delete require.cache[__filename];
const parentDir = path.dirname(module.parent.filename);

/**
 * Command line application helper for single commands
 * parses given flags, fail on missing required option
 * support customizable built-in help message generation
 */
const clito = function(options) {
  options = {
    pkg: readPkgUp.sync({
			cwd: parentDir,
			normalize: false
		}).pkg || {},
    argv: process.argv.slice(2),
    indentation: 0,
    showHelp: true,
    showVersion: true,
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
  const inputFlags = options.flags || {};
  const flagsArr = Object.keys(inputFlags).map(function(key) {
    return [key, inputFlags[key]];
  });

  // Return the command banner with name, version and description
  // separated by one blank line and optionally preceeded by custom text
  const getBanner = function() {
    return [
      options.banner,
      getVersion(),
      options.description || options.pkg.description
    ].filter(v => v && v !== '').join('\n\n');
  };

  // Return the command usage string
  const getUsage = function() {
    const pkgName = options.name || options.pkg.name;
    const usage = options.usage || `$ ${pkgName} [options] <input>`;
    return ['Usage:', indent(usage, 2)].join('\n');
  };

  // Return the usage examples string
  const getExamples = function() {
    const {examples} = options;
    if (!examples) {
      return '';
    }

    const outStr = (
      Array.isArray(examples)
        ? examples
        : [examples]
    ).map(s => indent(s, 2)).join('\n');

    return ['Examples:', outStr].join('\n');
  };

  // Return application name and version
  const getVersion = function() {
    const {pkg} =  options;
    const nameStr = (options.name || pkg.name) + ' ';
    const versionStr = `v${(options.version || pkg.version)}`;
    return nameStr + versionStr;
  };

  // Return the options usage string
  const getOptionsHelp = function() {
    const optNames = flagsArr.map(([name, opts]) => {
      const {alias, description} = opts;
      let outStr = [`--${name}`];
      alias && outStr.push(`-${alias}`);
      outStr = outStr.join(', ');
      return [outStr, description];
    });

    // Pad output strings using max width plus two spaces
    const maxWidth = optNames.reduce((max, [cur]) => cur.length > max ? cur.length : max, 0);
    const outStr = optNames.map(([opt, desc]) => {
      return opt.padEnd(maxWidth + 2) + (desc || '');
    }).join('\n');

    return ['Options:', indent(outStr, 2)].join('\n');
  };

  // Print application name and version
  const showVersion = function() {
    // eslint-disable-next-line
    console.log(getVersion());
    process.exit();
  };

  // Print command usage string and options help
  const showHelp = function() {
    const out = [
      getBanner(),
      getUsage(),
      getOptionsHelp(),
      getExamples()
    ].join('\n\n');

    // eslint-disable-next-line
    console.log(indent(out, options.indentation));
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

    if (typeof type === 'undefined') {
      throw new Error(`The "${flagName}" flag is missing type property.`);
    }

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
  if (args.version && options.showVersion) {
    showVersion();
  }

  // If --help has been passed as flag
  if (args.help && options.showHelp) {
    showHelp();
  }

  // Check for required options
  const flags = flagsArr.reduce(function(obj, [flagName, flagOpts]) {
    const flagValue = args[flagName];
    const isDefined = typeof flagValue !== 'undefined';

    // Verify if option is required
    if (!isDefined && flagOpts.required) {
      throw new Error(`Option "${flagName}" is required.`);
    }

    if (isDefined) {
      // Optionally validate parsed option value
      if (flagOpts.validation) {
        const isValid = flagOpts.validation(flagValue);
        if (isValid !== true) {
          const err = typeof isValid === 'string' ?
            isValid :
            `Invalid value "${flagValue}" for option "${flagName}".`;
          throw new Error(err);
        }
      }

      // Finally assign flag to object
      obj[flagOpts.alias || flagName] = flagValue;
      obj[flagName] = flagValue;
    }

    return obj;
  }, {});

  return {
    input,
    flags
  };
};

/**
 * Export module
 */
module.exports = clito;
module.exports.default = clito;
