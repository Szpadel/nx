"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var shared_1 = require("./shared");
var workspace_integrity_checks_1 = require("./workspace-integrity-checks");
var appRoot = require("app-root-path");
var path = require("path");
var fs = require("fs");
function lint() {
    var nodes = shared_1.getProjectNodes(shared_1.readAngularJson(), shared_1.readNxJson());
    var packageJson = JSON.parse(fs.readFileSync(appRoot.path + "/package.json", 'utf-8'));
    var errorGroups = new workspace_integrity_checks_1.WorkspaceIntegrityChecks(nodes, readAllFilesFromAppsAndLibs(), packageJson).run();
    if (errorGroups.length > 0) {
        errorGroups.forEach(function (g) {
            console.error(g.header + ":");
            g.errors.forEach(function (e) { return console.error(e); });
            console.log('');
        });
        process.exit(1);
    }
}
exports.lint = lint;
function readAllFilesFromAppsAndLibs() {
    return shared_1.allFilesInDir(appRoot.path + "/apps").concat(shared_1.allFilesInDir(appRoot.path + "/libs")).filter(function (f) { return !path.basename(f).startsWith('.'); });
}
