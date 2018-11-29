"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ast_utils_1 = require("../../src/utils/ast-utils");
function default_1() {
    return ast_utils_1.updateJsonInTree('package.json', function (packageJson) {
        packageJson.scripts['affected:lint'] =
            './node_modules/.bin/nx affected:lint';
        return packageJson;
    });
}
exports.default = default_1;
