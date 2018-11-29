"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var lib_versions_1 = require("../../../lib-versions");
var ast_utils_1 = require("@nrwl/schematics/src/utils/ast-utils");
function addNgRxToPackageJson() {
    return ast_utils_1.updateJsonInTree('package.json', function (packageJson) {
        if (!packageJson['dependencies']) {
            packageJson['dependencies'] = {};
        }
        if (!packageJson['devDependencies']) {
            packageJson['devDependencies'] = {};
        }
        if (!packageJson['dependencies']['@ngrx/store']) {
            packageJson['dependencies']['@ngrx/store'] = lib_versions_1.ngrxVersion;
        }
        if (!packageJson['dependencies']['@ngrx/effects']) {
            packageJson['dependencies']['@ngrx/effects'] = lib_versions_1.ngrxVersion;
        }
        if (!packageJson['dependencies']['@ngrx/entity']) {
            packageJson['dependencies']['@ngrx/entity'] = lib_versions_1.ngrxVersion;
        }
        if (!packageJson['devDependencies']['@ngrx/store-devtools']) {
            packageJson['devDependencies']['@ngrx/store-devtools'] = lib_versions_1.ngrxVersion;
        }
        if (!packageJson['dependencies']['@ngrx/router-store']) {
            packageJson['dependencies']['@ngrx/router-store'] = lib_versions_1.ngrxVersion;
        }
        if (!packageJson['devDependencies']['ngrx-store-freeze']) {
            packageJson['devDependencies']['ngrx-store-freeze'] = lib_versions_1.ngrxStoreFreezeVersion;
        }
        return packageJson;
    });
}
exports.addNgRxToPackageJson = addNgRxToPackageJson;
