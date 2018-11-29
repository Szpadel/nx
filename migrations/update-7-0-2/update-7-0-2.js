"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function fixKarmaConf(host, context) {
    if (!host.exists('karma.conf.js')) {
        context.logger.warn("Could not find ./karma.conf.js");
        context.logger.warn('It is recommended that your karma configuration sets autoWatch: true');
        return host;
    }
    var originalContent = host.read('karma.conf.js').toString();
    var content = originalContent.replace('autoWatch: false', 'autoWatch: true');
    if (content.includes('autoWatch: true')) {
        host.overwrite('karma.conf.js', content);
    }
    else {
        context.logger.warn('Could not alter ./karma.conf.js');
        context.logger.warn('It is recommended that your karma configuration sets autoWatch: true');
    }
    return host;
}
function default_1() {
    return fixKarmaConf;
}
exports.default = default_1;
