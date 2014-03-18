"use strict";

/*!
 * JST - middleware (adapted from the stylus middleware)
 *
 * MIT Licensed
 */

var extend = require('node.extend');
var fs = require('fs');

var mkdirp = require('mkdirp');
var path = require('path');

var generateModule = require('./main').generateModule;
var utilities = require('./utilities');

/**
 * Return Connect middleware with the given `options`.
 */
module.exports = function(source, options, templateSettings, outputSettings) {

    // Source dir is required.
    if (!source) {
        throw new Error('jst.middleware() requires `source` directory');
    }

    // Override the defaults for the middleware.
    options = extend(true, {
        debug: false,
        dest: source,
        force: false,
        once: false,
        pathRoot: null
    }, options || {});

    // Override the defaults for the parser.
    templateSettings = extend(true, {}, templateSettings || {});

    // Override the defaults for the compiler.
    outputSettings = extend(true, {}, outputSettings || {});

    // The log function is determined by the debug option.
    var log = (options.debug ? utilities.logDebug : utilities.log);

    // Parse and compile the CSS from the source string.
    var render = function(str, lessPath, cssPath, callback) {
        try {
            var result = generateModule(str, templateSettings, outputSettings);
            if (result.error) {
                throw result.error;
            }
        } catch (e) {
            return callback(err);
        }

        callback(null, result.code);

    };

    // Actual middleware.
    return function(req, res, next) {
        if ('GET' != req.method.toUpperCase() && 'HEAD' != req.method.toUpperCase()) { return next(); }

        var pathname = req.path;

        // Only handle the matching files in this middleware.
        if (utilities.isValidPath(pathname)) {
            var jsPath = path.join(options.dest, pathname);
            var jstPath = path.join(source, utilities.maybeCompressedSource(pathname));

            if (options.pathRoot) {
                pathname = pathname.replace(options.dest, '');
                jsPath = path.join(options.pathRoot, options.dest, pathname);
                jstPath = path.join(options.pathRoot, source, utilities.maybeCompressedSource(pathname));
            }

            // Allow for preprocessing the source filename.
//            jstPath = options.preprocess.path(jstPath, req);

            log('source', jstPath);
            log('dest', jsPath);

            // Ignore ENOENT to fall through as 404.
            var error = function(err) {
                return next('ENOENT' == err.code ? null : err);
            };

            var compile = function() {
                log('read', jstPath);

                fs.readFile(jstPath, 'utf8', function(err, jstSrc){
                    if (err) {
                        return error(err);
                    }

                    try {
//                        jstSrc = options.preprocess.less(jstSrc, req);
                        render(jstSrc, jstPath, jsPath, function(err, code){
                            if (err) {
                                console.log(error);
                                return next(err);
                            }

                            mkdirp(path.dirname(jsPath), 511 /* 0777 */, function(err){
                                if (err) return next(err);

                                fs.writeFile(jsPath, code, 'utf8', next);
                            });

                            log('render', jsPath);

                            // Allow postprocessing on the css.
//                            css = options.postprocess.css(css, req);

                            // Allow postprocessing for custom storage.
//                            options.storeCss(jsPath, css, next);
                        });
                    } catch (err) {
//                        utilities.lessError(err);
                        console.log(err);
                        return next(err);
                    }
                });
            };

            // Force recompile of all files.
            if (options.force) {
                return compile();
            }

            // Compare mtimes to determine if changed.
            fs.stat(jstPath, function(err, lessStats){
                if (err) {
                    return error(err);
                }

                fs.stat(jsPath, function(err, cssStats){
                    // CSS has not been compiled, compile it!
                    if (err) {
                        if ('ENOENT' == err.code) {
                            log('not found', jsPath);

                            // No CSS file found in dest
                            return compile();
                        } else {
                            return next(err);
                        }
                    } else if (lessStats.mtime > cssStats.mtime) {
                        // Source has changed, compile it
                        log('modified', jsPath);

                        return compile();
                    } else {
                        return next();
                    }
                });
            });
        } else {
            return next();
        }
    };
};
