/* global module:false */
'use strict';

module.exports = function (grunt) {
    const pkg = require('./package.json');
    bumpVersion(pkg);
    grunt.initConfig({
        pkg: pkg,

        eslint: {
            files: ['src/**/*.js', 'Gruntfile.js', '__tests__/*-test.js'],
            options: {
                configFile: '.eslintrc'
            }
        },

        browserify: {
            browser: {
                options: {
                    transform: [['babelify', {sourceMaps: true, presets: ['es2015'], plugins: ['add-module-exports']}]],
                    browserifyOptions: {
                        standalone: 'colors',
                        builtins: true,
                        commondir: false,
                        browserField: true
                    }
                },
                files: {
                    'dist/<%= pkg.name%>.js': 'src/color-everywhere.js'
                }
            },
            node: {
                options: {
                    transform: [['babelify', {sourceMaps: true, presets: ['es2015'], plugins: ['add-module-exports']}]],
                    // Avoid `window` checking
                    browserifyOptions: {
                        standalone: 'dummyPlaceholder',
                        // https://github.com/substack/node-browserify/issues/1277#issuecomment-115198436
                        builtins: true,
                        commondir: false,
                        browserField: false, // Avoid `browser` entry in package.json
                        insertGlobalVars: {
                            process: function () {
                                return;
                            }
                        }
                    }
                },
                files: {
                    'dist/<%= pkg.name%>-node.js': 'src/color-everywhere.js'
                }
            }
        },
        // Temporarily disabling here (and in "main"/"browser" in package.json)
        //   pending https://github.com/mishoo/UglifyJS2/issues/448
        uglify: {
            browser: {
                options: {
                    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */\n',
                    sourceMap: true,
                    sourceMapName: 'dist/<%=pkg.name%>.min.js.map'
                },
                src: 'dist/<%= pkg.name%>.js',
                dest: 'dist/<%=pkg.name%>.min.js'
            },
            node: {
                options: {
                    banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' + '<%= grunt.template.today("yyyy-mm-dd") %> */\n',
                    sourceMap: true,
                    sourceMapName: 'dist/<%=pkg.name%>-node.min.js.map'
                },
                src: 'dist/<%= pkg.name%>-node.js',
                dest: 'dist/<%=pkg.name%>-node.min.js'
            }
        },

        'mocha-chai-sinon': {
            test: {
                options: {
                    ui: 'bdd',
                    // require: 'babel-register', // Not supported
                    bail: false,
                    timeout: 5000,
                    reporter: 'spec',
                    quiet: false // Optionally suppress output to standard out (defaults to false)
                    // clearRequireCache: false // Optionally clear the require cache before running tests (defaults to false)
                },
                src: ['__tests__/*.js']
            }
        },

        connect: {
            server: {
                options: {
                    base: '.',
                    port: 9998
                }
            }
        },

        watch: {
            all: {
                files: ['src/**/*.js'],
                tasks: ['eslint', 'browserify'] // , 'uglify'
            }
        }
    });

    for (const key in grunt.file.readJSON('package.json').devDependencies) {
        if (key !== 'grunt' && key.indexOf('grunt') === 0) { grunt.loadNpmTasks(key); }
    }

    grunt.registerTask('build-browser', ['eslint', 'browserify:browser']); // , 'uglify:browser']);
    grunt.registerTask('build-node', ['eslint', 'browserify:node']); // , 'uglify:node']);
    grunt.registerTask('build', ['eslint', 'browserify']); // , 'uglify'

    grunt.registerTask('mocha', ['mocha-chai-sinon:test']);

    grunt.registerTask('default', 'build');
    grunt.registerTask('dev', ['build', 'connect', 'watch:all']);
    grunt.registerTask('dev-browser', ['build-browser', 'connect', 'watch:all']);
    grunt.registerTask('dev-node', ['build-node', 'connect', 'watch:all']);
};

/**
 * Bumps the revision number of the node package object, so the the banner in indexeddbshim.min.js
 * will match the next upcoming revision of the package.
 */
function bumpVersion (pkg) {
    const version = pkg.version.split('.');
    version[2] = parseInt(version[2]) + 1;
    pkg.version = version.join('.');
}
