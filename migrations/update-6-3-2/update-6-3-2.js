"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tasks_1 = require("@angular-devkit/schematics/tasks");
var ast_utils_1 = require("../../src/utils/ast-utils");
function default_1() {
    return function (host, context) {
        return ast_utils_1.updateJsonInTree('package.json', function (json) {
            var devDependencies = json.devDependencies;
            if (!devDependencies) {
                return json;
            }
            if (devDependencies['jest-preset-angular']) {
                devDependencies['jest-preset-angular'] = '6.0.1';
                context.addTask(new tasks_1.NodePackageInstallTask());
            }
            return json;
        })(host, context);
    };
}
exports.default = default_1;
