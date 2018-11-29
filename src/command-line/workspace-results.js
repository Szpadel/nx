"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var fileutils_1 = require("../utils/fileutils");
var fs_1 = require("fs");
var literals_1 = require("@angular-devkit/core/src/utils/literals");
var RESULTS_FILE = 'dist/.nx-results';
var WorkspaceResults = /** @class */ (function () {
    function WorkspaceResults(command) {
        this.command = command;
        this.commandResults = {
            command: this.command,
            results: {}
        };
        var resultsExists = fs.existsSync(RESULTS_FILE);
        if (!resultsExists) {
            this.startedWithFailedProjects = false;
        }
        else {
            var commandResults = fileutils_1.readJsonFile(RESULTS_FILE);
            this.startedWithFailedProjects = commandResults.command === command;
            if (this.startedWithFailedProjects) {
                this.commandResults = commandResults;
            }
        }
    }
    Object.defineProperty(WorkspaceResults.prototype, "failedProjects", {
        get: function () {
            return Object.entries(this.commandResults.results)
                .filter(function (_a) {
                var _ = _a[0], result = _a[1];
                return !result;
            })
                .map(function (_a) {
                var project = _a[0];
                return project;
            });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(WorkspaceResults.prototype, "hasFailure", {
        get: function () {
            return Object.values(this.commandResults.results).some(function (result) { return !result; });
        },
        enumerable: true,
        configurable: true
    });
    WorkspaceResults.prototype.getResult = function (projectName) {
        return this.commandResults.results[projectName];
    };
    WorkspaceResults.prototype.fail = function (projectName) {
        this.setResult(projectName, false);
    };
    WorkspaceResults.prototype.success = function (projectName) {
        this.setResult(projectName, true);
    };
    WorkspaceResults.prototype.saveResults = function () {
        if (Object.values(this.commandResults.results).includes(false)) {
            fileutils_1.writeJsonFile(RESULTS_FILE, this.commandResults);
        }
        else if (fs.existsSync(RESULTS_FILE)) {
            fs_1.unlinkSync(RESULTS_FILE);
        }
    };
    WorkspaceResults.prototype.printResults = function (onlyFailed, successMessage, failureMessage) {
        var failedProjects = this.failedProjects;
        if (this.failedProjects.length === 0) {
            console.log(successMessage);
            if (onlyFailed && this.startedWithFailedProjects) {
                console.warn(literals_1.stripIndents(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n          Warning: Only failed affected projects were run.\n          You should run above command WITHOUT --only-failed\n        "], ["\n          Warning: Only failed affected projects were run.\n          You should run above command WITHOUT --only-failed\n        "]))));
            }
        }
        else {
            console.error(failureMessage);
            console.log("Failed projects: " + failedProjects.join(','));
            if (!onlyFailed && !this.startedWithFailedProjects) {
                console.log("You can isolate the above projects by passing --only-failed");
            }
        }
    };
    WorkspaceResults.prototype.setResult = function (projectName, result) {
        this.commandResults.results[projectName] = result;
    };
    return WorkspaceResults;
}());
exports.WorkspaceResults = WorkspaceResults;
var templateObject_1;
