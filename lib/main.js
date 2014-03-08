var _ = require('lodash');
var UglifyJS = require('uglify-js');
var os = require('os');


/**
 * util
 */
function getDeclareInfo(namespace) {
  namespace = namespace.split('.');
  var code = [];
  var declare = 'this';
  for (var i = 0, l = namespace.length; i < l; i++) {
    var part = namespace[i];
    declare += '[' + JSON.stringify(part) + ']';
    code.push(declare + ' = ' + declare + ' || {};');
  }

  return {
    declare: declare,
    code: code.join(os.EOL) + os.EOL
  };
}
/**
 * beautify javascript code
 */
function beautifyCode(code) {
  var ast = UglifyJS.parse(code);
  var stream = UglifyJS.OutputStream({
    beautify: true,
    indent_level: 2,
    comments: true
  });

  ast.print(stream);

  return stream.toString();
}


/**
 * @param {string} [text=''] The template string.
 * @param {Object} [options] The options object.
 * @param {RegExp} [options.escape] The HTML "escape" delimiter.
 * @param {RegExp} [options.evaluate] The "evaluate" delimiter.
 * @param {Object} [options.imports] An object to import into the template as local variables.
 * @param {RegExp} [options.interpolate] The "interpolate" delimiter.
 * @param {string} [options.sourceURL] The sourceURL of the template's compiled source.
 * @param {string} [options.variable] The data object variable name.
 * @returns {string} Returns the compiled function string
 *
 * see: http://lodash.com/docs#template
 */
function compileUnderscore(text, options) {
  var source = _.template(text, null, options).source;

  var replacer = function(str) {
    str = String(str);
    var toBeReplaced = /[&<>'"]/g;
    var htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    str = str.replace(toBeReplaced, function(match) {
      return htmlEscapes[match];
    });

    return str;
  };

  source = source.replace('_.escape', replacer.toString());

  return source;
}

/**
 * @param {string} [text=''] The template string.
 * @param {Object} [compileOptions] The options object, see argument `options` of function `compileUnderscore`
 * @param {Object} [outputOptions]
 * @param {string} [outputOptions.style] enum, ['kmd', 'amd'], output compiled function as KISSY module or amd module
 * @param {Object} [outputOptions.style] output compiled function as a variable assignment
 * @param {string} [outputOptions.style.namespace] the variable name of compile function
 * @param {Function} [outputOptions.processContent] process `text` before compile it
 * @param {string} [outputOptions.modName] the name of the module, must be specified when `outputOptions.style` is object
 * @param {boolean} [outputOptions.beautify] beautify the compiled code
 * @returns {Object}
 * @returns {Object} [return.error]
 * @returns {string} [return.error.message] the error message
 * @returns {string} [return.code] the module code
 */
function generateModule(text, compileOptions, outputOptions) {
  outputOptions = outputOptions || {};
  // default options
  _.defaults(outputOptions, {
    style: 'kmd',
    beautify: true
  });

  if (_.isFunction(outputOptions.processContent)) {
    text = outputOptions.processContent(text);
  }
  var code = compileUnderscore(text, compileOptions);

  var generatedCode,
      error;
  // transform to KISSY module
  if (outputOptions.style === 'kmd') {
    generatedCode = 'KISSY.add(' +
                    (outputOptions.modName ?
                      JSON.stringify(outputOptions.modName) + ', ' :
                      ''
                    ) +
                    'function(S) {' + os.EOL +
                    'return ' +
                    code + os.EOL +
                    '});';
  }
  // amd module
  else if (outputOptions.style === 'amd') {
    generatedCode = 'define(' +
                    (outputOptions.modName ?
                      JSON.stringify(outputOptions.modName) + ', ' :
                      ''
                    ) +
                    'function(require, expor+ts, module) {' + os.EOL +
                    'return ' +
                    code + os.EOL +
                    '});';
  }
  // namespace module, generate a variable
  else {
    var style = outputOptions.style;
    if (!_.isObject(style)) {
      error = {
        message: '[outputOptions.style] must be:' + os.EOL +
                 ' "kmd" or' + os.EOL +
                 ' "amd" or' + os.EOL +
                 ' {' + os.EOL +
                 '   namespace: "xxx"' + os.EOL +
                 ' }'
      };
    } else {
      var namespace = style.namespace || 'underscoreTmplFn';
      var nameInfo = getDeclareInfo(namespace);

      generatedCode = nameInfo.code +
                      nameInfo.declare + '[' + JSON.stringify(outputOptions.modName) + ']' +
                      ' = ' + code + ';';
    }
  }


  if (outputOptions.beautify) {
    generatedCode = beautifyCode(generatedCode);
  }

  return {
    error: error,
    code: generatedCode
  };
}


exports.compileUnderscore = compileUnderscore;
exports.generateModule = generateModule;
