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
var ast_utils_1 = require("../../utils/ast-utils");
var common_1 = require("../../utils/common");
var core_1 = require("@angular-devkit/core");
function generateFiles(options) {
    return function (host, context) {
        var projectConfig = ast_utils_1.getProjectConfig(host, options.project);
        return schematics_1.mergeWith(schematics_1.apply(schematics_1.url('./files'), [
            schematics_1.template(__assign({ tmpl: '' }, options, { projectRoot: projectConfig.root, offsetFromRoot: common_1.offsetFromRoot(projectConfig.root) })),
            options.skipSetupFile
                ? schematics_1.filter(function (file) { return file !== '/src/test-setup.ts'; })
                : schematics_1.noop(),
            schematics_1.move(projectConfig.root)
        ]))(host, context);
    };
}
function updateTsConfig(options) {
    return function (host, context) {
        var projectConfig = ast_utils_1.getProjectConfig(host, options.project);
        return ast_utils_1.updateJsonInTree(core_1.join(projectConfig.root, 'tsconfig.json'), function (json) {
            return __assign({}, json, { compilerOptions: __assign({}, json.compilerOptions, { types: json.compilerOptions.types.concat(['node', 'jest']) }) });
        });
    };
}
function updateAngularJson(options) {
    return ast_utils_1.updateJsonInTree('angular.json', function (json) {
        var projectConfig = json.projects[options.project];
        projectConfig.architect.test = {
            builder: '@nrwl/builders:jest',
            options: {
                jestConfig: core_1.join(core_1.normalize(projectConfig.root), 'jest.config.js'),
                tsConfig: core_1.join(core_1.normalize(projectConfig.root), 'tsconfig.spec.json')
            }
        };
        if (!options.skipSetupFile) {
            projectConfig.architect.test.options.setupFile = core_1.join(core_1.normalize(projectConfig.root), 'src/test-setup.ts');
        }
        if (projectConfig.architect.lint) {
            projectConfig.architect.lint.options.tsConfig = projectConfig.architect.lint.options.tsConfig.concat([
                core_1.join(core_1.normalize(projectConfig.root), 'tsconfig.spec.json')
            ]);
        }
        return json;
    });
}
function check(options) {
    return function (host, context) {
        var projectConfig = ast_utils_1.getProjectConfig(host, options.project);
        if (projectConfig.architect.test) {
            throw new Error(options.project + " already has a test architect option.");
        }
        var packageJson = ast_utils_1.readJsonInTree(host, 'package.json');
        if (!packageJson.devDependencies.jest) {
            return schematics_1.schematic('jest', {});
        }
    };
}
function default_1(options) {
    return schematics_1.chain([
        check(options),
        generateFiles(options),
        updateTsConfig(options),
        updateAngularJson(options)
    ]);
}
exports.default = default_1;
