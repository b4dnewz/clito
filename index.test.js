const temp = require('@b4dnewz/temp');
const clito = require('./index');

describe('clito', function () {
    it('exports a function', function () {
        expect(typeof clito).toEqual('function');
    });

    it('boolean flags are false by default', function () {
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
        expect(res.flags).toMatchObject({
            foo: true,
            bar: true,
            baz: false
        });
    });

    it('support default values', function () {
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
        expect(res.flags).toMatchObject({
            foo: 'bar',
            bar: ''
        });
    });

    it('support flag alias', function () {
        const res = clito({
            argv: ['-f', 'bar'],
            flags: {
                foo: {
                    type: 'string',
                    alias: 'f'
                }
            }
        });
        expect(res.flags).toMatchObject({
            f: 'bar',
            foo: 'bar'
        });
    });

    it('use last flag value', function () {
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

    it('support boolean negation flags', function () {
        expect(clito({
            argv: [
                '--no-cors'
            ],
            flags: {
                cors: {
                    type: 'boolean',
                    default: true
                }
            }
        }).flags).toMatchObject({
            cors: false
        });
    });

    it('support grouped flags', function () {
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
        expect(res.flags).toMatchObject({
            f: true,
            foo: true,
            b: true,
            bar: true,
        });
    });

    it('support multiple flag arguments', function () {
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
    });

    it('throw if required flag is missing', function () {
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

    it('support flag value validation', function () {
        const validation = v => ['bar', 'baz'].includes(v);
        expect(() => {
            clito({
                argv: ['--foo', 'bar'],
                flags: {
                    foo: {
                        type: 'string',
                        validation
                    },
                }
            });
        }).not.toThrowError();

        expect(() => {
            clito({
                argv: ['--foo', 'bat'],
                flags: {
                    foo: {
                        type: 'string',
                        validation
                    },
                }
            });
        }).toThrowError('Invalid value "bat" for option "foo".');
    });

    it('support custom flag validation error message', function () {
        const values = ['bar', 'baz'];
        const validationMessage = `Invalid value, possible values are: [${values.join(',')}]`;
        const validation = v => ['bar', 'baz'].includes(v) || `Invalid value, possible values are: [${values.join(',')}]`;
        expect(() => {
            clito({
                argv: ['--foo', 'bat'],
                flags: {
                    foo: {
                        type: 'string',
                        validation
                    },
                }
            });
        }).toThrowError(validationMessage);
    });

    it('should normalize input flag name', function () {
        expect(clito({
            argv: [
                "--foo-bar",
                "--foo-baz",
            ],
            flags: {
                fooBar: {
                    type: 'boolean'
                },
                fooBaz: {
                    type: 'boolean',
                    default: true
                }
            }
        }).flags).toEqual({
            fooBar: true,
            fooBaz: true
        });
    });

    it('should support local configuration file', function () {
        const config = { foo: { bar: [1, 2], baz: true } };
        const configStr = JSON.stringify(config);
        const tmpFile = temp.fileSync(configStr, { name: 'config.json' });
        expect(clito({
            argv: ['--config', tmpFile.path],
            flags: {
                foo: {
                    description: 'Valid only with configuration file'
                }
            }
        }).flags).toEqual(config);
    });

    describe('--version', function () {
        let consoleMock = jest.spyOn(console, 'log');

        beforeEach(function () {
            consoleMock.mockClear();
        });

        it('can be disabled', function () {
            clito({
                argv: ['--version'],
                showVersion: false
            });
            expect(consoleMock).not.toHaveBeenCalled();
        });

        it('outputs program version', function () {
            clito({ argv: ['--version'] });
            expect(consoleMock).toHaveBeenCalled();
            expect(consoleMock.mock.calls[0][0]).toMatch(/clito v(\d)/);
        });

        it('outputs custom program version', function () {
            clito({
                argv: ['--version'],
                name: 'clito-test',
                version: '1.0.0'
            });
            expect(consoleMock).toHaveBeenCalled();
            expect(consoleMock.mock.calls[0][0]).toMatch('clito-test v1.0.0');
        });
    });

    describe('--help', function () {
        let exitMock = jest.spyOn(process, 'exit').mockImplementation(() => { });
        let consoleMock = jest.spyOn(console, 'log');

        beforeEach(function () {
            exitMock.mockClear();
            consoleMock.mockClear();
        });

        it('can be disabled', function () {
            clito({
                argv: ['--help'],
                version: '0.0.0',
                showHelp: false,
                flags: {
                    foo: {
                        type: 'string',
                        description: 'Prints bar'
                    }
                }
            });
            expect(consoleMock).not.toHaveBeenCalled();
            expect(exitMock).not.toHaveBeenCalled();
        });

        it('support built in commands help', function () {
            clito({
                argv: ['--help'],
                version: '0.0.0',
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

        it('support custom usage string', function () {
            clito({
                argv: ['--help'],
                version: '0.0.0',
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

        it('support single custom usage example', function () {
            clito({
                argv: ['--help'],
                version: '0.0.0',
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

        it('support multiple custom usage examples', function () {
            clito({
                argv: ['--help'],
                version: '0.0.0',
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

        it('support custom banner', function () {
            clito({
                banner: 'A TEST COMMAND',
                argv: ['--help'],
                version: '0.0.0',
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
