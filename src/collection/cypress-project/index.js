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
var core_1 = require("@angular-devkit/core");
// app
var ast_utils_1 = require("../../utils/ast-utils");
var lib_versions_1 = require("../../lib-versions");
var common_1 = require("../../utils/common");
function checkArchitectTarget(options) {
    return function (host) {
        var projectConfig = ast_utils_1.getProjectConfig(host, options.e2eProjectName);
        if (!projectConfig.architect.e2e) {
            return ast_utils_1.updateJsonInTree('angular.json', function (json) {
                json.projects[options.e2eProjectName] = {};
                return json;
            });
        }
        return schematics_1.noop();
    };
}
function installDependencies(dependencyList) {
    var addedDependencies = dependencyList.reduce(function (dictionary, value) {
        dictionary[value.name] = value.version;
        return dictionary;
    }, {});
    var updatePackageJson = ast_utils_1.updateJsonInTree('package.json', function (json) {
        return __assign({}, json, { devDependencies: __assign({}, json.devDependencies, addedDependencies) });
    });
    function doInstall(host, context) {
        context.addTask(new tasks_1.NodePackageInstallTask());
    }
    return schematics_1.chain([updatePackageJson, doInstall]);
}
function checkDependenciesInstalled() {
    return function (host) {
        var packageJson = ast_utils_1.readJsonInTree(host, 'package.json');
        var dependencyList = [];
        if (!packageJson.devDependencies.cypress) {
            dependencyList.push({ name: 'cypress', version: lib_versions_1.cypressVersion });
            // NOTE: Need to be removed on the next Cypress release (=>3.1.1)
            dependencyList.push({ name: '@types/jquery', version: '3.3.6' });
        }
        if (!packageJson.devDependencies['@nrwl/builders']) {
            dependencyList.push({ name: '@nrwl/builders', version: lib_versions_1.nxVersion });
        }
        if (!dependencyList.length) {
            return schematics_1.noop();
        }
        return installDependencies(dependencyList);
    };
}
function generateFiles(options) {
    return function (host) {
        host.delete(options.e2eProjectRoot + "/tsconfig.e2e.json");
        var projectConfig = ast_utils_1.getProjectConfig(host, options.e2eProjectName);
        return schematics_1.mergeWith(schematics_1.apply(schematics_1.url('./files'), [
            schematics_1.template({
                tmpl: '',
                projectName: options.e2eProjectName,
                relatedProjectName: options.name,
                projectRoot: projectConfig.root,
                offsetFromRoot: common_1.offsetFromRoot(projectConfig.root)
            }),
            schematics_1.move(projectConfig.root)
        ]));
    };
}
function updateTsConfig(options) {
    return ast_utils_1.updateJsonInTree(core_1.join(core_1.normalize(options.e2eProjectRoot), 'tsconfig.json'), function (json) {
        return __assign({}, json, { compilerOptions: __assign({}, json.compilerOptions, { types: json.compilerOptions.types.concat(['cypress']) }) });
    });
}
function updateAngularJson(options) {
    return ast_utils_1.updateJsonInTree('angular.json', function (json) {
        var projectConfig = json.projects[options.e2eProjectName];
        projectConfig.root = options.e2eProjectRoot;
        projectConfig.architect.e2e = {
            builder: '@nrwl/builders:cypress',
            options: {
                cypressConfig: core_1.join(core_1.normalize(options.e2eProjectRoot), 'cypress.json'),
                tsConfig: core_1.join(core_1.normalize(options.e2eProjectRoot), 'tsconfig.e2e.json'),
                devServerTarget: options.name + ":serve"
            },
            configurations: {
                production: {
                    devServerTarget: options.name + ":serve:production"
                }
            }
        };
        projectConfig.architect.lint.options.tsConfig = core_1.join(core_1.normalize(options.e2eProjectRoot), 'tsconfig.e2e.json');
        json.projects[options.e2eProjectName] = projectConfig;
        return json;
    });
}
function default_1(options) {
    return schematics_1.chain([
        checkArchitectTarget(options),
        checkDependenciesInstalled(),
        updateAngularJson(options),
        updateTsConfig(options),
        generateFiles(options)
    ]);
}
exports.default = default_1;
