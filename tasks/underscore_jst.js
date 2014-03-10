/*
 * grunt-underscore-jst
 * https://github.com/myhere/grunt-underscore-jst
 *
 * Copyright (c) 2014 myhere
 * Licensed under the MIT license.
 */

'use strict';

var transformer = require('../lib/main');
var _ = require('lodash');

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('underscore_jst', 'Precompile Underscore template to JST', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      // see lo-dash `template()` argument `options`
      templateSettings: {
      },
      outputSettings: {
      }
    });

    // Iterate over all specified file groups.
    this.files.forEach(function(f) {
      // Concat specified files.
      var src = f.src.filter(function(filepath) {
        // Warn on and remove invalid source files (if nonull was set).
        if (!grunt.file.exists(filepath)) {
          grunt.log.warn('Source file "' + filepath + '" not found.');
          return false;
        } else {
          return true;
        }
      }).map(function(filepath) {
        // Read file source.
        var text = grunt.file.read(filepath);
        var templateSettings = options.templateSettings,
            outputSettings = options.outputSettings;

        var modName;
        if (_.isFunction(outputSettings.processName)) {
          modName = outputSettings.processName(filepath);
        } else {
          modName = filepath;
        }
        outputSettings.modName = modName;

        var result = transformer.generateModule(text, templateSettings, outputSettings);

        if (result.error) {
          grunt.log.error(result.error.message);
          grunt.fail.warn('Error.');
        } else {
          // Write the destination file.
          grunt.file.write(f.dest, result.code);
          // Print a success message.
          grunt.log.writeln('File "' + f.dest.cyan + '" created.');
        }
      });
    });
  });

};
