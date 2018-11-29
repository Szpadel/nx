"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var common_1 = require("../common");
var ast_utils_1 = require("../ast-utils");
/**
 * This returns a Rule which changes the default Angular CLI Generated karma.conf.js
 * @param options Object containing projectROot
 */
function updateKarmaConf(options) {
    return function (host, context) {
        var project = ast_utils_1.getProjectConfig(host, options.projectName);
        var projectRoot = project.root.replace(/\/$/, '');
        var karmaPath = project.architect.test.options.karmaConfig;
        ast_utils_1.createOrUpdate(host, karmaPath, "// Karma configuration file, see link for more information\n// https://karma-runner.github.io/1.0/config/configuration-file.html\n\nconst { join } = require('path');\nconst getBaseKarmaConfig = require('" + common_1.offsetFromRoot(projectRoot) + "karma.conf');\n\nmodule.exports = function(config) {\n  const baseConfig = getBaseKarmaConfig();\n  config.set({\n    ...baseConfig,\n    coverageIstanbulReporter: {\n      ...baseConfig.coverageIstanbulReporter,\n      dir: join(__dirname, '" + common_1.offsetFromRoot(projectRoot) + "coverage/" + projectRoot + "')\n    }\n  });\n};\n");
        return host;
    };
}
exports.updateKarmaConf = updateKarmaConf;
