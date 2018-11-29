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
var ast_utils_1 = require("../../src/utils/ast-utils");
var tasks_1 = require("@angular-devkit/schematics/tasks");
function updateDependencies() {
    return ast_utils_1.updateJsonInTree('package.json', function (json) {
        json.dependencies = json.dependencies || {};
        json.dependencies = __assign({}, json.dependencies, { '@ngrx/effects': '6.1.0', '@ngrx/store': '6.1.0', '@ngrx/router-store': '6.1.0' });
        json.devDependencies = json.devDependencies || {};
        json.devDependencies = __assign({}, json.devDependencies, { '@angular/cli': '6.2.4', '@angular-devkit/build-angular': '~0.8.0', '@ngrx/store-devtools': '6.1.0', karma: '~3.0.0', 'karma-coverage-istanbul-reporter': '~2.0.1', protractor: '~5.4.0', 'ts-node': '~7.0.0', tslint: '~5.11.0', typescript: '~2.9.2' });
        if (json.devDependencies['@angular-devkit/build-ng-packagr']) {
            json.devDependencies['@angular-devkit/build-ng-packagr'] = '~0.8.0';
        }
        return json;
    });
}
var addInstall = function (_, context) {
    context.addTask(new tasks_1.NodePackageInstallTask());
};
var ɵ0 = addInstall;
exports.ɵ0 = ɵ0;
function default_1() {
    return schematics_1.chain([updateDependencies(), addInstall]);
}
exports.default = default_1;
