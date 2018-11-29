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
var core_1 = require("@angular-devkit/core");
var tasks_1 = require("@angular-devkit/schematics/tasks");
var lib_versions_1 = require("../../lib-versions");
var common_1 = require("../../utils/common");
function default_1(options) {
    if (!options.name) {
        throw new Error("Invalid options, \"name\" is required.");
    }
    if (!options.directory) {
        options.directory = options.name;
    }
    return function (host, context) {
        addTasks(options, context);
        var npmScope = options.npmScope ? options.npmScope : options.name;
        var templateSource = schematics_1.apply(schematics_1.url('./files'), [
            schematics_1.template(__assign({ utils: core_1.strings, dot: '.', tmpl: '' }, lib_versions_1.libVersions, options, { npmScope: npmScope, defaultNrwlPrettierConfig: JSON.stringify(common_1.DEFAULT_NRWL_PRETTIER_CONFIG, null, 2) }))
        ]);
        return schematics_1.chain([schematics_1.branchAndMerge(schematics_1.chain([schematics_1.mergeWith(templateSource)]))])(host, context);
    };
}
exports.default = default_1;
function addTasks(options, context) {
    var packageTask;
    if (!options.skipInstall) {
        packageTask = context.addTask(new tasks_1.NodePackageInstallTask(options.directory));
    }
    if (!options.skipGit) {
        var commit = typeof options.commit == 'object'
            ? options.commit
            : !!options.commit ? {} : false;
        context.addTask(new tasks_1.RepositoryInitializerTask(options.directory, commit), packageTask ? [packageTask] : []);
    }
}
