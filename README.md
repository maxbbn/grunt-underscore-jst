# grunt-underscore-jst

> Precompile Underscore template to JST, a node module, also a grunt plugin, also a gulp plugin. The generated code is not dependent on [underscore](http://underscorejs.org/).

## Grunt plugin
This plugin requires Grunt `~0.4.2`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-underscore-jst --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-underscore-jst');
```

## The "underscore_jst" task

### Overview
In your project's Gruntfile, add a section named `underscore_jst` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  underscore_jst: {
    options: {
      templateSettings: {
        // escape,
        // evaluate,
        // imports,
        // interpolate,
        // variable
      },
      outputSettings: {
        // style,
        // withModName,
        // processName,
        // processContent,
        // beautify
      },
    },
    my_target: {
      files: [
        {
          expand: true,
          src: 'tmpls/*.html',
          rename: function(dest, src) {
            return src + '.js';
          }
        }
      ]
    }
  },
});
```

### Options

#### options.templateSettings
Type: `Object`
Default value: `{}`
See: [_.template() argument `options`](http://lodash.com/docs#template)

A string value that is used to do something with whatever.

#### options.outputSettings
Type: `Object`
Default value: `{}`

A string value that is used to do something else with whatever else.

#### options.outputSettings.style
Type: `string` or `Object`
Default Value: `'kmd'`
* when is `string`, it's enumerable, ie 'kmd' or 'amd'
* when is `Object`, `options.outputSettings.style.namespace` is the jst variable name

#### options.outputSettings.withModName
Type: `boolean`
Default Value: `false`
When `options.outputSettings.style` is enuerable, it tells whether generate `modName`

#### options.outputSettings.processName(filepath)
Type: `Function`
Default Value: `null`
* argument `filepath` is the file path 
* `return` value is `modName`

#### options.outputSettings.processContent(text)
Type: `Function`
Default Value: `string`
* argument `text` is the file content;
* `return` value is the content to be compiled

#### options.outputSettings.beautify
Type: `boolean`
Default Value: `true`
Whether pretty the compiled js code



## Node module

```js
var compiler = require('grunt-underscore-jst');

var result = compiler.generateModule(text, templateSettings, templateSettings);

if (!result.error) {
  console.log(result.code);
}
```

### generateModule(text, templateSettings, outputSettings)
* parameters document plz see [lib/main.js](./lib/main.js)

