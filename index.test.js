const clito = require('./index');

describe('clito', function() {
  it('export a function', function() {
    expect(typeof clito).toEqual('function');
  });

  it('boolean flags are false by default', function() {
    const res = clito({
      argv: ['--foo'],
      flags: {
        foo: {
          type: 'boolean'
        },
        bar: {
          type: 'boolean',
          default: true
        },
        baz: {
          type: 'boolean'
        }
      }
    });
    expect(typeof res).toEqual('object');
    expect(res.flags).toMatchObject({
      foo: true,
      bar: true,
      baz: false
    });
  });

  it('support default values', function() {
    const res = clito({
      argv: ['--foo', '--bar'],
      flags: {
        foo: {
          type: 'string',
          default: 'bar'
        },
        bar: {
          type: 'string'
        }
      }
    });
    expect(typeof res).toEqual('object');
    expect(res.flags).toMatchObject({
      foo: 'bar',
      bar: ''
    });
  });

  it('support alias', function() {
    const res = clito({
      argv: ['-f', 'bar'],
      flags: {
        foo: {
          type: 'string',
          alias: 'f'
        }
      }
    });
    expect(typeof res).toEqual('object');
    expect(res.flags).toMatchObject({
      f: 'bar',
      foo: 'bar'
    });
  });

  it('remove duplicate when not multiple', function() {
    expect(clito({
      argv: [
        '-f',
        'bar',
        '-f',
        'baz',
      ],
      flags: {
        foo: {
          type: 'string',
          alias: 'f'
        }
      }
    }).flags).toMatchObject({
      foo: 'baz'
    });
  });

  it('support grouped flags', function() {
    const res = clito({
      argv: ['-fb'],
      flags: {
        foo: {
          type: 'boolean',
          alias: 'f'
        },
        bar: {
          type: 'boolean',
          alias: 'b'
        }
      }
    });
    expect(typeof res).toEqual('object');
    expect(res.flags).toMatchObject({
      f: true,
      foo: true,
      b: true,
      bar: true,
    });
  });

  it('support multiple flag arguments', function() {
    const flags = {
      foo: {
        type: 'string',
        multiple: true
      }
    };

    expect(clito({
      argv: ['--foo=a'],
      flags
    }).flags).toMatchObject({
      foo: ['a']
    });

    expect(clito({
      argv: [
        '--foo',
        'a',
        'b'
      ],
      flags
    }).flags).toMatchObject({
      foo: ['a', 'b']
    });

    expect(clito({
      argv: [
        '--foo=a',
        '--foo=b'
      ],
      flags
    }).flags).toMatchObject({
      foo: ['a', 'b']
    });
  });

  it('support required options', function() {
    expect(() => {
      clito({
        argv: ['--foo'],
        flags: {
          foo: {
            type: 'boolean'
          },
          bar: {
            type: 'string',
            required: true
          }
        }
      });
    }).toThrowError('Option "bar" is required');
  });

  describe('--version', function() {
    let consoleMock = jest.spyOn(console, 'log');

    afterEach(function() {
      consoleMock.mockClear();
    });

    it('can be disabled', function() {
      clito({
        argv: ['--version'],
        showVersion: false
      });
      expect(consoleMock).not.toHaveBeenCalled();
    });

    it('output program version', function() {
      clito({ argv: ['--version'] });
      expect(consoleMock).toHaveBeenCalled();
      expect(consoleMock.mock.calls[0][0]).toMatch(/clito v(\d)/);
    });

    it('output custom program version', function() {
      clito({
        argv: ['--version'],
        name: 'clito-test',
        version: '1.0.0'
      });
      expect(consoleMock).toHaveBeenCalled();
      expect(consoleMock.mock.calls[0][0]).toMatch('clito-test v1.0.0');
    });
  });

  describe('--help', function() {
    let exitMock = jest.spyOn(process, 'exit').mockImplementation(() => {});
    let consoleMock = jest.spyOn(console, 'log');

    afterEach(function() {
      exitMock.mockClear();
      consoleMock.mockClear();
    });

    it('can be disabled', function() {
      clito({
        argv: ['--help'],
        showHelp: false,
        flags: {
          foo: {
            type: 'string',
            description: 'Prints bar'
          }
        }
      });
      expect(consoleMock).not.toHaveBeenCalled();
      expect(exitMock).toHaveBeenCalled();
    });

    it('support built in commands help', function() {
      clito({
        argv: ['--help'],
        flags: {
          foo: {
            type: 'string',
            description: 'Prints bar',
            alias: 'f',
            default: 'bar'
          },
          bar: {
            type: 'boolean'
          }
        }
      });
      expect(consoleMock.mock.calls[0][0]).toMatchSnapshot();
      expect(exitMock).toHaveBeenCalled();
    });

    it('support custom usage string', function() {
      clito({
        argv: ['--help'],
        usage: '$ foo <input>',
        flags: {
          foo: {
            type: 'boolean',
            description: 'a test option'
          },
          bar: {
            type: 'boolean',
            description: 'another test option'
          },
          baz: {
            type: 'string'
          }
        }
      });
      expect(consoleMock.mock.calls[0][0]).toMatchSnapshot();
      expect(exitMock).toHaveBeenCalled();
    });

    it('support single custom usage example', function() {
      clito({
        argv: ['--help'],
        flags: {
          foo: {
            type: 'boolean',
            description: 'a test option'
          }
        },
        examples: 'foo -foo'
      });
      expect(consoleMock.mock.calls[0][0]).toMatchSnapshot();
      expect(exitMock).toHaveBeenCalled();
    });

    it('support multiple custom usage examples', function() {
      clito({
        argv: ['--help'],
        flags: {
          foo: {
            type: 'boolean',
            description: 'a test option'
          }
        },
        examples: ['foo -foo', 'foo --no-foo']
      });
      expect(consoleMock.mock.calls[0][0]).toMatchSnapshot();
      expect(exitMock).toHaveBeenCalled();
    });

    it('support custom banner', function() {
      clito({
        banner: 'A TEST COMMAND',
        argv: ['--help'],
        flags: {
          foo: {
            type: 'boolean',
            description: 'a test option'
          }
        }
      });
      expect(consoleMock.mock.calls[0][0]).toMatchSnapshot();
      expect(exitMock).toHaveBeenCalled();
    });
  });
});
