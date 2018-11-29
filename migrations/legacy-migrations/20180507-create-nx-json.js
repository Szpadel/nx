"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var fileutils_1 = require("../../src/utils/fileutils");
var literals_1 = require("@angular-devkit/core/src/utils/literals");
exports.default = {
    description: "Create nx.json before migrating to Angular CLI 6.",
    run: function () {
        if (!fs_1.existsSync('.angular-cli.json') && fs_1.existsSync('angular.json')) {
            console.warn(literals_1.stripIndents(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n        You have already upgraded to Angular CLI 6.\n        We will not be able to recover information about your project's tags for you.\n      "], ["\n        You have already upgraded to Angular CLI 6.\n        We will not be able to recover information about your project's tags for you.\n      "]))));
            return;
        }
        var angularJson = fileutils_1.readJsonFile('.angular-cli.json');
        var projects = angularJson.apps.reduce(function (projects, app) {
            if (app.name === '$workspaceRoot') {
                return projects;
            }
            var normalizedName = app.name.replace(new RegExp('/', 'g'), '-');
            projects[normalizedName] = {
                tags: app.tags
            };
            if (app.root.startsWith('apps/')) {
                projects[normalizedName + "-e2e"] = {
                    tags: []
                };
            }
            return projects;
        }, {});
        fs_1.writeFileSync('nx.json', fileutils_1.serializeJson({
            npmScope: angularJson.project.npmScope,
            projects: projects
        }));
    }
};
var templateObject_1;
