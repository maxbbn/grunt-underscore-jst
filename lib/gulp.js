var es = require('event-stream');
var JST = require('./main');

module.exports = function (templateSetting, outputSetting) {
    templateSetting = templateSetting || {};
    outputSetting = outputSetting || {};

    function compile(file, callback) {
        var isStream = file.contents && typeof file.contents.on === 'function' && typeof file.contents.pipe === 'function';
        var isBuffer = file.contents instanceof Buffer;

        if (isStream) {
            return callback(new Error('grunt-underscore-jst: Cannot do compile on a stream'), file);
        }

        var regTail = /\.jst\.html$/;

        if (!regTail.test(file.path)) {
            return callback(null, file);
        }

        if (isBuffer) {
            var result = JST.generateModule(String(file.contents), templateSetting, outputSetting);

            if (result.error) {
                callback(result.error);
                return;
            }

            file.contents = new Buffer(result.code);
            file.path = file.path.replace(regTail, '.jst.js');
        }

        callback(null, file);
    }

    return es.map(compile);
};