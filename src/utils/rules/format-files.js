"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var ast_utils_1 = require("../ast-utils");
var schematics_1 = require("@angular-devkit/schematics");
var literals_1 = require("@angular-devkit/core/src/utils/literals");
var FormatFiles = /** @class */ (function () {
    function FormatFiles() {
    }
    FormatFiles.prototype.toConfiguration = function () {
        return {
            name: 'node-package',
            options: {
                packageName: 'run format -- --untracked',
                quiet: true
            }
        };
    };
    return FormatFiles;
}());
function formatFiles(options) {
    if (options === void 0) { options = { skipFormat: false }; }
    if (options.skipFormat) {
        return schematics_1.noop();
    }
    return function (host, context) {
        var packageJson = ast_utils_1.readJsonInTree(host, 'package.json');
        if (packageJson.scripts && packageJson.scripts.format) {
            context.addTask(new FormatFiles());
        }
        else {
            context.logger.warn(literals_1.stripIndents(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n        Files were not formated during this code generation.\n        The \"format\" npm script is missing in your package.json.\n        Please either add a format script or pass --skip-format.\n      "], ["\n        Files were not formated during this code generation.\n        The \"format\" npm script is missing in your package.json.\n        Please either add a format script or pass --skip-format.\n      "]))));
        }
    };
}
exports.formatFiles = formatFiles;
var templateObject_1;
