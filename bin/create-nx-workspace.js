#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _a;
var child_process_1 = require("child_process");
var tmp_1 = require("tmp");
var semver_1 = require("semver");
var fs_1 = require("fs");
var path = require("path");
var yargsParser = require("yargs-parser");
var fileutils_1 = require("../src/utils/fileutils");
var lib_versions_1 = require("../src/lib-versions");
var parsedArgs = yargsParser(process.argv, {
    string: ['directory'],
    boolean: ['yarn', 'bazel', 'help']
});
if (parsedArgs.help) {
    console.log("\n    Usage: create-nx-workspace <directory> [options] [ng new options]\n\n    Create a new Nx workspace (that is to say a new angular-cli project using @nrwl/schematics)\n\n    Options:\n\n      directory             path to the workspace root directory\n      --yarn                use yarn (default to false)\n      --bazel               use bazel instead of webpack (default to false)\n\n      [ng new options]      any 'ng new' options\n                            run 'ng new --help' for more information\n  ");
    process.exit(0);
}
var useYarn = parsedArgs.yarn;
var schematicsTool = {
    name: 'Schematics',
    packageName: '@nrwl/schematics'
};
var bazelTool = {
    name: 'Bazel',
    packageName: '@nrwl/bazel'
};
var nxTool = parsedArgs.bazel ? bazelTool : schematicsTool;
if (!useYarn) {
    try {
        // check the correct version of the NPM is installed
        var output = child_process_1.execSync('npm --version').toString();
        if (semver_1.lt(output, '5.0.0')) {
            console.error('To create a workspace you must have NPM >= 5.0.0 installed.');
            process.exit(1);
        }
    }
    catch (e) {
        console.error('Cannot find npm. If you want to use yarn to create a project, pass the --yarn flag.');
        process.exit(1);
    }
}
var projectName = parsedArgs._[2];
if (parsedArgs.bazel) {
    if (!/^\w+$/.test(projectName)) {
        console.error(projectName + " is invalid for a bazel workspace.\n" +
            'Your workspace name must contain only alphanumeric characters and underscores.');
        process.exit(1);
    }
}
// check that the workspace name is passed in
if (!projectName) {
    console.error('Please provide a project name (e.g., create-nx-workspace nrwl-proj)');
    process.exit(1);
}
// creating the sandbox
console.log("Creating a sandbox with the CLI and Nx " + nxTool.name + "...");
var tmpDir = tmp_1.dirSync().name;
// we haven't updated bazel to CLI6 yet
var nxVersion = parsedArgs.bazel
    ? '1.0.3'
    : fileutils_1.readJsonFile(path.join(path.dirname(__dirname), 'package.json')).version;
var cliVersion = parsedArgs.bazel ? '1.7.2' : lib_versions_1.angularCliVersion;
fs_1.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({
    dependencies: (_a = {},
        _a[nxTool.packageName] = nxVersion,
        _a['@angular/cli'] = cliVersion,
        _a),
    license: 'MIT'
}));
if (useYarn) {
    child_process_1.execSync('yarn install --silent', { cwd: tmpDir, stdio: [0, 1, 2] });
}
else {
    child_process_1.execSync('npm install --silent', { cwd: tmpDir, stdio: [0, 1, 2] });
}
var packageManagerOption = useYarn ? '--packageManager=yarn' : '';
var ɵ1 = function (a) { return a !== '--yarn' && a !== '--bazel'; }, ɵ0 = function (a) { return "\"" + a + "\""; };
exports.ɵ1 = ɵ1;
exports.ɵ0 = ɵ0;
// creating the app itself
var args = process.argv
    .slice(2)
    .filter(ɵ1)
    .map(ɵ0)
    .join(' ');
console.log("ng new " + args + " --collection=" + nxTool.packageName + " " + packageManagerOption);
child_process_1.execSync(path.join(tmpDir, 'node_modules', '.bin', 'ng') + " new " + args + " --collection=" + nxTool.packageName + " " + packageManagerOption, {
    stdio: [0, 1, 2]
});
