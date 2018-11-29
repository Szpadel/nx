"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var schematics_1 = require("@angular-devkit/schematics");
var ast_utils_1 = require("../../src/utils/ast-utils");
var literals_1 = require("@angular-devkit/core/src/utils/literals");
function displayInformation(host, context) {
    context.logger.info(literals_1.stripIndents(templateObject_1 || (templateObject_1 = __makeTemplateObject(["Prettier has been updated to 1.15.1 which has support for formatting html!\n      Formatting of your code might change as you are working on each file.\n\n      Optional: You may want to run \"npm run format\" as part of this update to reformat all files in your workspace.\n\n      You can also opt out of formatting in files by adding them to the .prettierignore file in the root of your workspace."], ["Prettier has been updated to 1.15.1 which has support for formatting html!\n      Formatting of your code might change as you are working on each file.\n\n      Optional: You may want to run \"npm run format\" as part of this update to reformat all files in your workspace.\n\n      You can also opt out of formatting in files by adding them to the .prettierignore file in the root of your workspace."]))));
}
function createPrettierIgnore(host, context) {
    if (!host.exists('.prettierignore')) {
        host.create('.prettierignore', '# Add files here to ignore them from prettier formatting\n');
    }
}
function default_1() {
    return schematics_1.chain([
        ast_utils_1.updateJsonInTree('package.json', function (json) {
            json.scripts = json.scripts || {};
            json.devDependencies = json.devDependencies || {};
            json.scripts = __assign({}, json.scripts, { affected: './node_modules/.bin/nx affected' });
            json.devDependencies = __assign({}, json.devDependencies, { prettier: '1.15.2' });
            return json;
        }),
        createPrettierIgnore,
        displayInformation
    ]);
}
exports.default = default_1;
var templateObject_1;
