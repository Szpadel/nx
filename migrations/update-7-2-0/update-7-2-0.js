"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var schematics_1 = require("@angular-devkit/schematics");
var core_1 = require("@angular-devkit/core");
var path_1 = require("path");
var ast_utils_1 = require("../../src/utils/ast-utils");
var cli_config_utils_1 = require("../../src/utils/cli-config-utils");
var common_1 = require("../../src/utils/common");
var literals_1 = require("@angular-devkit/core/src/utils/literals");
function getBuilders(project) {
    return Array.from(new Set(Object.values(project.architect).map(function (target) { return target.builder; })));
}
var builderTypes = {
    '@angular-devkit/build-angular:karma': ['jasmine'],
    '@angular-devkit/build-angular:protractor': ['jasmine', 'jasminewd2'],
    '@nrwl/builders:jest': ['jest', 'node'],
    '@nrwl/builers:cypress': ['cypress']
};
function getTypes(host, project, context) {
    var types = [];
    var tsConfigs = getTsConfigs(project).map(function (tsconfigPath) {
        return ast_utils_1.readJsonInTree(host, tsconfigPath);
    });
    var tsConfigsWithNoTypes = getTsConfigs(project).filter(function (tsconfigPath) {
        var tsconfig = ast_utils_1.readJsonInTree(host, tsconfigPath);
        return !tsconfig.compilerOptions.types;
    });
    if (tsConfigsWithNoTypes.length > 0) {
        context.logger.warn(literals_1.stripIndents(templateObject_1 || (templateObject_1 = __makeTemplateObject(["The following tsconfigs had no types defined: ", ""], ["The following tsconfigs had no types defined: ",
            ""])), tsConfigsWithNoTypes.join(',')));
        return undefined;
    }
    types = types.concat.apply(types, tsConfigs.map(function (tsconfig) { return tsconfig.compilerOptions.types || []; }));
    types = types.concat.apply(types, getBuilders(project)
        .filter(function (builder) { return builder in builderTypes; })
        .map(function (builder) { return builderTypes[builder]; }));
    return types.filter(function (type, i, arr) { return arr.indexOf(type) === i; }); // dedupe the array;
}
function createTsConfig(project) {
    return function (host, context) {
        var tsConfigPath = core_1.join(core_1.normalize(project.root), 'tsconfig.json');
        if (host.exists(tsConfigPath)) {
            return schematics_1.noop();
        }
        host.create(tsConfigPath, '{}');
        var types = getTypes(host, project, context);
        if (types === undefined) {
            context.logger.warn(literals_1.stripIndents(templateObject_2 || (templateObject_2 = __makeTemplateObject(["No types array was added to ", " meaning the editor might encounter conflicts for types.}"], ["No types array was added to ", " meaning the editor might encounter conflicts for types.}"])), tsConfigPath));
        }
        return ast_utils_1.updateJsonInTree(tsConfigPath, function () {
            return {
                extends: common_1.offsetFromRoot(project.root) + "tsconfig.json",
                compilerOptions: {
                    types: types
                }
            };
        });
    };
}
function getTsConfigs(project) {
    return Array.from(new Set(Object.values(project.architect)
        .reduce(function (arr, target) {
        return arr.concat((target.options ? [target.options] : []), Object.values(target.configurations || {}));
    }, [])
        .reduce(function (arr, options) {
        if (!options.tsConfig) {
            return arr;
        }
        if (!Array.isArray(options.tsConfig)) {
            return arr.includes(options.tsConfig)
                ? arr
                : arr.concat([options.tsConfig]);
        }
        return arr.concat(options.tsConfig.filter(function (tsconfig) { return !arr.includes(tsconfig); }));
    }, [])
        .map(function (tsconfig) {
        return core_1.normalize(tsconfig);
    })));
}
function updateTsConfig(project, tsconfig) {
    return ast_utils_1.updateJsonInTree(tsconfig, function (json) {
        json.extends =
            core_1.dirname(tsconfig) === core_1.normalize(project.root)
                ? './tsconfig.json'
                : path_1.relative(core_1.dirname(tsconfig), core_1.join(project.root, 'tsconfig.json'));
        return json;
    });
}
function updateTsConfigs(project) {
    return function (host, context) {
        return schematics_1.chain(getTsConfigs(project).map(function (tsconfig) { return updateTsConfig(project, tsconfig); }));
    };
}
function updateProjects(host) {
    var projects = ast_utils_1.readJsonInTree(host, cli_config_utils_1.getWorkspacePath(host)).projects;
    return schematics_1.chain(Object.values(projects).map(function (project) {
        return schematics_1.chain([createTsConfig(project), updateTsConfigs(project)]);
    }));
}
function displayInformation(host, context) {
    context.logger
        .info(literals_1.stripIndents(templateObject_3 || (templateObject_3 = __makeTemplateObject(["With this update, we are changing the structure of the tsconfig files.\n    A tsconfig.json has been added to all project roots which is used by editors to provide intellisense.\n    The tsconfig.(app|lib|spec|e2e).json files now all extend off of the tsconfig.json in the project root.\n    To find out more, visit our wiki: https://github.com/nrwl/nx/wiki/Workspace-Organization#tsconfigs"], ["With this update, we are changing the structure of the tsconfig files.\n    A tsconfig.json has been added to all project roots which is used by editors to provide intellisense.\n    The tsconfig.(app|lib|spec|e2e).json files now all extend off of the tsconfig.json in the project root.\n    To find out more, visit our wiki: https://github.com/nrwl/nx/wiki/Workspace-Organization#tsconfigs"]))));
}
function default_1() {
    return schematics_1.chain([updateProjects, displayInformation]);
}
exports.default = default_1;
var templateObject_1, templateObject_2, templateObject_3;
