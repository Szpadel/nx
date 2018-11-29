"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var cosmiconfig = require("cosmiconfig");
var lib_versions_1 = require("../lib-versions");
var ast_utils_1 = require("./ast-utils");
var core_1 = require("@angular-devkit/core");
function addUpgradeToPackageJson() {
    return ast_utils_1.updateJsonInTree('package.json', function (packageJson) {
        if (!packageJson['dependencies']) {
            packageJson['dependencies'] = {};
        }
        if (!packageJson['dependencies']['@angular/upgrade']) {
            packageJson['dependencies']['@angular/upgrade'] =
                packageJson['dependencies']['@angular/core'];
        }
        if (!packageJson['dependencies']['angular']) {
            packageJson['dependencies']['angular'] = lib_versions_1.angularJsVersion;
        }
        return packageJson;
    });
}
exports.addUpgradeToPackageJson = addUpgradeToPackageJson;
function offsetFromRoot(fullPathToSourceDir) {
    var parts = core_1.normalize(fullPathToSourceDir).split('/');
    var offset = '';
    for (var i = 0; i < parts.length; ++i) {
        offset += '../';
    }
    return offset;
}
exports.offsetFromRoot = offsetFromRoot;
exports.DEFAULT_NRWL_PRETTIER_CONFIG = {
    singleQuote: true
};
function resolveUserExistingPrettierConfig() {
    var explorer = cosmiconfig('prettier', {
        sync: true,
        cache: false,
        rcExtensions: true,
        stopDir: process.cwd(),
        transform: function (result) {
            if (result && result.config) {
                delete result.config.$schema;
            }
            return result;
        }
    });
    return Promise.resolve(explorer.load(process.cwd())).then(function (result) {
        if (!result) {
            return null;
        }
        return {
            sourceFilepath: result.filepath,
            config: result.config
        };
    });
}
exports.resolveUserExistingPrettierConfig = resolveUserExistingPrettierConfig;
