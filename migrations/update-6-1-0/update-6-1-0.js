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
    context.logger.info(literals_1.stripIndents(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n    \"implicitDependencies\" have been added to your nx.json.\n  "], ["\n    \"implicitDependencies\" have been added to your nx.json.\n  "]))));
    context.logger.warn(literals_1.stripIndents(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n    Files not defined in implicitDependencies will NOT affect your projects.\n\n    .ie yarn affected:apps --files=README.md will return no apps since it is not defined.\n\n    You should add additional files which you expect to affect your projects into this configuration.\n  "], ["\n    Files not defined in implicitDependencies will NOT affect your projects.\n\n    .ie yarn affected:apps --files=README.md will return no apps since it is not defined.\n\n    You should add additional files which you expect to affect your projects into this configuration.\n  "]))));
}
var ɵ0 = function (nxJson) {
    return __assign({}, nxJson, { implicitDependencies: {
            'angular.json': '*',
            'package.json': '*',
            'tsconfig.json': '*',
            'tslint.json': '*',
            'nx.json': '*'
        } });
};
exports.ɵ0 = ɵ0;
var addImplicitDependencies = ast_utils_1.updateJsonInTree('nx.json', ɵ0);
var ɵ1 = function (packageJson) {
    packageJson.scripts.update = 'ng update @nrwl/schematics';
    packageJson.scripts['update:check'] = 'ng update';
    delete packageJson.scripts['update:skip'];
    return packageJson;
};
exports.ɵ1 = ɵ1;
var changeNpmRunUpdate = ast_utils_1.updateJsonInTree('package.json', ɵ1);
function default_1() {
    return schematics_1.chain([
        displayInformation,
        addImplicitDependencies,
        changeNpmRunUpdate
    ]);
}
exports.default = default_1;
var templateObject_1, templateObject_2;
