"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var schematics_1 = require("@angular-devkit/schematics");
var literals_1 = require("@angular-devkit/core/src/utils/literals");
var ast_utils_1 = require("../../src/utils/ast-utils");
var tasks_1 = require("@angular-devkit/schematics/tasks");
function displayInformation(_, context) {
    context.logger.info(literals_1.stripIndents(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n    A global base karma config has been added at karma.conf.js\n    \n    This file exports a karma config to be extended in each project\n\n    This new file is not being used yet!\n\n    Generate a new project to see an example of how it might be used.\n  "], ["\n    A global base karma config has been added at karma.conf.js\n    \n    This file exports a karma config to be extended in each project\n\n    This new file is not being used yet!\n\n    Generate a new project to see an example of how it might be used.\n  "]))));
}
function setDependencyVersionIfExisting(packageNames, version, areDev) {
    return ast_utils_1.updateJsonInTree('package.json', function (json) {
        var dependencies = areDev ? json.devDependencies : json.dependencies;
        packageNames
            .filter(function (packageName) { return !!dependencies[packageName]; })
            .forEach(function (packageName) {
            dependencies[packageName] = version;
        });
        return json;
    });
}
function updateDependencies() {
    return schematics_1.chain([
        ast_utils_1.updateJsonInTree('package.json', function (json) {
            json.scripts = json.scripts || {};
            json.dependencies = json.dependencies || {};
            json.devDependencies = json.devDependencies || {};
            json.scripts['affected:libs'] = './node_modules/.bin/nx affected:libs';
            if (json.dependencies['@ngrx/store-devtools']) {
                json.devDependencies['@ngrx/store-devtools'] =
                    json.dependencies['@ngrx/store-devtools'];
                delete json.dependencies['@ngrx/store-devtools'];
            }
            if (json.dependencies['ngrx-store-freeze']) {
                json.devDependencies['ngrx-store-freeze'] =
                    json.dependencies['ngrx-store-freeze'];
                delete json.dependencies['ngrx-store-freeze'];
            }
            delete json.devDependencies['@ngrx/schematics'];
            return json;
        }),
        setDependencyVersionIfExisting([
            '@angular/animations',
            '@angular/common',
            '@angular/compiler',
            '@angular/core',
            '@angular/forms',
            '@angular/http',
            '@angular/platform-browser',
            '@angular/platform-browser-dynamic',
            '@angular/platform-server',
            '@angular/platform-webworker',
            '@angular/platform-webworker-dynamic',
            '@angular/router',
            '@angular/service-worker',
            '@angular/upgrade'
        ], '^6.1.0', false),
        setDependencyVersionIfExisting(['rxjs'], '6.2.2', false),
        setDependencyVersionIfExisting(['@ngrx/effects', '@ngrx/store', '@ngrx/router-store'], '6.0.1', false),
        setDependencyVersionIfExisting(['@angular/cli'], '6.1.2', true),
        setDependencyVersionIfExisting(['@angular/compiler-cli', '@angular/language-service'], '^6.1.0', true),
        setDependencyVersionIfExisting(['@angular-devkit/build-angular'], '~0.7.0', true),
        setDependencyVersionIfExisting(['ngrx-store-freeze'], '0.2.4', true),
        setDependencyVersionIfExisting(['@ngrx/store-devtools'], '6.0.1', true),
        setDependencyVersionIfExisting(['typescript'], '~2.7.2', true)
    ]);
}
function addGlobalKarmaConf() {
    var templateSource = schematics_1.url('./files');
    return schematics_1.mergeWith(templateSource);
}
var addInstall = function (_, context) {
    context.addTask(new tasks_1.NodePackageInstallTask());
};
var ɵ0 = addInstall;
exports.ɵ0 = ɵ0;
function default_1() {
    return schematics_1.chain([
        displayInformation,
        updateDependencies(),
        addGlobalKarmaConf(),
        addInstall
    ]);
}
exports.default = default_1;
var templateObject_1;
