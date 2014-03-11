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
 * @description: only support three style, placeholder [```, ``, `]
 * @param {string} [str='']
 */
function colorfullStr(str) {
  var styles = {
    '```': 'red.bold',
    '``' : 'cyan.bold',
    '`'  : 'cyan'
  };
  var keys = Object.keys(styles);

  var getColoredStr = function(str, style) {
    var styleArr = style.split('.');

    return styleArr.reduce(function(prevValue, currValue) {
             return prevValue[currValue] ? prevValue[currValue] : prevValue;
           }, str);
  };
  var reducer = function(prevValue, currValue, idx) {
    // add some color to message
    var parts,
        colorParts;
    parts = prevValue.split(currValue);
    colorParts = parts.map(function(msg, idx) {
      if (idx % 2 == 1) {
        return getColoredStr(msg, styles[currValue]);
      } else {
        return msg;
      }
    });

    return colorParts.join('');
  };

  var coloredStr = keys.reduce(reducer, str);

  return coloredStr;
}


/**
 * @param {string} [text=''] The template string.
 * @param {Object} [options] The options object.
 * @param {RegExp} [options.escape] The HTML "escape" delimiter.
 * @param {RegExp} [options.evaluate] The "evaluate" delimiter.
 * @param {Object} [options.imports] An object to import into the template as local variables.
 * @param {RegExp} [options.interpolate] The "interpolate" delimiter.
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
 * @param {Object} [templateSettings] The options object, see argument `options` of function `compileUnderscore`
 * @param {Object} [outputSettings]
 * @param {string} [outputSettings.style] enum, ['kmd', 'amd'], output compiled function as KISSY module or amd module
 * @param {Object} [outputSettings.style] output compiled function as a variable assignment
 * @param {string} [outputSettings.style.namespace] the variable name of compile function
 * @param {boolean} [outputSettings.withModName] generate modName when `outputSettings.style` is 'kmd' or 'amd'
 * @param {Function} [outputSettings.processContent] process `text` before compile it
 * @param {string} [outputSettings.modName] the name of the module, must be specified when `outputSettings.style` is object
 * @param {boolean} [outputSettings.beautify] beautify the compiled code
 * @returns {Object}
 * @returns {Object} [return.error]
 * @returns {string} [return.error.message] the error message
 * @returns {string} [return.code] the module code
 */
function generateModule(text, templateSettings, outputSettings) {
  outputSettings = outputSettings || {};
  // default options
  _.defaults(outputSettings, {
    style: 'kmd',
    beautify: true
  });


  if (_.isFunction(outputSettings.processContent)) {
    text = outputSettings.processContent(text);
  }
  var code = compileUnderscore(text, templateSettings);

  var generatedCode,
      error;
  // transform to KISSY module
  if (outputSettings.style === 'kmd') {
    generatedCode = 'KISSY.add(' +
                    (outputSettings.withModName ?
                      JSON.stringify(outputSettings.modName) + ', ' :
                      ''
                    ) +
                    'function(S) {' + os.EOL +
                    'return ' +
                    code + os.EOL +
                    '});';
  }
  // amd module
  else if (outputSettings.style === 'amd') {
    generatedCode = 'define(' +
                    (outputSettings.withModName ?
                      JSON.stringify(outputSettings.modName) + ', ' :
                      ''
                    ) +
                    'function(require, expor+ts, module) {' + os.EOL +
                    'return ' +
                    code + os.EOL +
                    '});';
  }
  // namespace module, generate a variable
  else {
    var style = outputSettings.style;
    if (!_.isObject(style)) {
      var message = 'Property ``[outputSettings.style]`` must be:' + os.EOL +
                    ' `"kmd"` or' + os.EOL +
                    ' `"amd"` or' + os.EOL +
                    ' `{ `' + os.EOL +
                    '   `namespace: "xxx"`' + os.EOL +
                    ' `}`'
      var error = {
        message: colorfullStr(message)
      };
    } else {
      var namespace = style.namespace || 'underscoreTmplFn';
      var nameInfo = getDeclareInfo(namespace);

      generatedCode = nameInfo.code +
                      nameInfo.declare + '[' + JSON.stringify(outputSettings.modName) + ']' +
                      ' = ' + code + ';';
    }
  }


  if (outputSettings.beautify && !error) {
    generatedCode = beautifyCode(generatedCode);
  }

  return {
    error: error,
    code: generatedCode
  };
}


exports.compileUnderscore = compileUnderscore;
exports.generateModule = generateModule;
