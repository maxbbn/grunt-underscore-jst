# def-underscore

> Precompile Underscore template to JST, a node module, also a grunt plugin.

## Grunt plugin
This plugin requires Grunt `~0.4.2`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install def-underscore --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('def-underscore');
```

## The "def_underscore" task

### Overview
In your project's Gruntfile, add a section named `def_underscore` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  def_underscore: {
    options: {
      // Task-specific options go here.
    },
    your_target: {
      // Target-specific file lists and/or options go here.
    },
  },
});
```

### Options

#### options.templateOptions
Type: `Object`
Default value: `',  '`

A string value that is used to do something with whatever.

#### options.outputOptions
Type: `Object`
Default value: `'.'`

A string value that is used to do something else with whatever else.

#### options.rename
Type: `Function`

### Usage Examples

#### Default Options
In this example, the default options are used to do something with whatever. So if the `testing` file has the content `Testing` and the `123` file had the content `1 2 3`, the generated result would be `Testing, 1 2 3.`

```js
grunt.initConfig({
  def_underscore: {
    options: {},
    files: {
      'dest/default_options': ['src/testing', 'src/123'],
    },
  },
});
```


## Node module

```js
var compiler = require('def-underscore');

var result = compiler.generateModule(text, compileOptions, outputOptions);

if (!result.error) {
  console.log(result.code);
}
```

### generateModule
* parameters document plz see [lib/main.js](./lib/main.js)

