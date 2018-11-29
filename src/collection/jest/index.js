"use strict";
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
var tasks_1 = require("@angular-devkit/schematics/tasks");
var ast_utils_1 = require("../../utils/ast-utils");
var lib_versions_1 = require("../../lib-versions");
var ɵ0 = function (json) {
    json.devDependencies = __assign({}, json.devDependencies, { '@nrwl/builders': lib_versions_1.nxVersion, jest: lib_versions_1.jestVersion, '@types/jest': lib_versions_1.jestVersion, 'jest-preset-angular': lib_versions_1.jestPresetAngularVersion });
    return json;
};
exports.ɵ0 = ɵ0;
var updatePackageJson = ast_utils_1.updateJsonInTree('package.json', ɵ0);
function addInstall(_, context) {
    context.addTask(new tasks_1.NodePackageInstallTask());
}
function default_1() {
    return schematics_1.chain([schematics_1.mergeWith(schematics_1.url('./files')), updatePackageJson, addInstall]);
}
exports.default = default_1;
