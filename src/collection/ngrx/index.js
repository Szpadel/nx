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
var path = require("path");
var name_utils_1 = require("../../utils/name-utils");
var rules_1 = require("./rules");
var format_files_1 = require("../../utils/rules/format-files");
var tasks_1 = require("@angular-devkit/schematics/tasks");
/**
 * Rule to generate the Nx 'ngrx' Collection
 * Note: see https://nrwl.io/nx/guide-setting-up-ngrx for guide to generated files
 */
function generateNgrxCollection(_options) {
    return function (host, context) {
        var options = normalizeOptions(_options);
        if (!options.module) {
            throw new Error("The required --module option must be passed");
        }
        else if (!host.exists(options.module)) {
            throw new Error("Path does not exist: " + options.module);
        }
        var requestContext = {
            featureName: options.name,
            moduleDir: path.dirname(options.module),
            options: options,
            host: host
        };
        var fileGeneration = !options.onlyEmptyRoot
            ? [generateNgrxFilesFromTemplates(options)]
            : [];
        var moduleModification = !options.onlyAddFiles
            ? [
                rules_1.addImportsToModule(requestContext),
                rules_1.addExportsToBarrel(requestContext.options)
            ]
            : [];
        var packageJsonModification = !options.skipPackageJson
            ? [rules_1.addNgRxToPackageJson(), addInstallTask]
            : [];
        return schematics_1.chain(fileGeneration.concat(moduleModification, packageJsonModification, [
            format_files_1.formatFiles(options)
        ]))(host, context);
    };
}
exports.default = generateNgrxCollection;
function addInstallTask(_, context) {
    context.addTask(new tasks_1.NodePackageInstallTask());
}
// ********************************************************
// Internal Function
// ********************************************************
/**
 * Generate 'feature' scaffolding: actions, reducer, effects, interfaces, selectors, facade
 */
function generateNgrxFilesFromTemplates(options) {
    var name = options.name;
    var moduleDir = path.dirname(options.module);
    var excludeFacade = function (path) { return path.match(/^((?!facade).)*$/); };
    var templateSource = schematics_1.apply(schematics_1.url('./files'), [
        !options.facade ? schematics_1.filter(excludeFacade) : schematics_1.noop(),
        schematics_1.template(__assign({}, options, { tmpl: '' }, name_utils_1.names(name))),
        schematics_1.move(moduleDir)
    ]);
    return schematics_1.mergeWith(templateSource);
}
/**
 * Extract the parent 'directory' for the specified
 */
function normalizeOptions(options) {
    return __assign({}, options, { directory: name_utils_1.toFileName(options.directory) });
}
