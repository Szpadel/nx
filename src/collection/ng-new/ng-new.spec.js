"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular-devkit/schematics/testing");
var path = require("path");
var schematics_1 = require("@angular-devkit/schematics");
describe('app', function () {
    var schematicRunner = new testing_1.SchematicTestRunner('@nrwl/schematics', path.join(__dirname, '../../collection.json'));
    var projectTree;
    beforeEach(function () {
        projectTree = schematics_1.Tree.empty();
    });
    it('should update angular.json', function () {
        var tree = schematicRunner.runSchematic('ng-new', { name: 'proj' }, projectTree);
    });
    it('should create files', function () {
        var tree = schematicRunner.runSchematic('ng-new', { name: 'proj' }, projectTree);
        expect(tree.exists('/proj/nx.json')).toBe(true);
        expect(tree.exists('/proj/angular.json')).toBe(true);
        expect(tree.exists('/proj/.prettierrc')).toBe(true);
        expect(tree.exists('/proj/.prettierignore')).toBe(true);
        expect(tree.exists('/proj/karma.conf.js')).toBe(true);
    });
    it('should create a root karma configuration', function () {
        var tree = schematicRunner.runSchematic('ng-new', { name: 'proj' }, projectTree);
        expect(tree.readContent('/proj/karma.conf.js')).toBe("// Karma configuration file, see link for more information\n// https://karma-runner.github.io/1.0/config/configuration-file.html\n\nconst { join } = require('path');\nconst { constants } = require('karma');\n\nmodule.exports = () => {\n  return {\n    basePath: '',\n    frameworks: ['jasmine', '@angular-devkit/build-angular'],\n    plugins: [\n      require('karma-jasmine'),\n      require('karma-chrome-launcher'),\n      require('karma-jasmine-html-reporter'),\n      require('karma-coverage-istanbul-reporter'),\n      require('@angular-devkit/build-angular/plugins/karma')\n    ],\n    client: {\n      clearContext: false // leave Jasmine Spec Runner output visible in browser\n    },\n    coverageIstanbulReporter: {\n      dir: join(__dirname, '../../coverage'),\n      reports: ['html', 'lcovonly'],\n      fixWebpackSourcePaths: true\n    },\n    reporters: ['progress', 'kjhtml'],\n    port: 9876,\n    colors: true,\n    logLevel: constants.LOG_INFO,\n    autoWatch: true,\n    browsers: ['Chrome'],\n    singleRun: true\n  };\n};\n");
    });
    it('should not set package manager by default', function () {
        var treeNoPackages = schematicRunner.runSchematic('ng-new', { name: 'proj' }, projectTree);
        expect(JSON.parse(treeNoPackages.readContent('/proj/angular.json')).cli
            .packageManager).toBeUndefined();
    });
    it('should set package manager when provided', function () {
        var tree = schematicRunner.runSchematic('ng-new', { name: 'proj', packageManager: 'yarn' }, projectTree);
        expect(JSON.parse(tree.readContent('/proj/angular.json')).cli.packageManager).toEqual('yarn');
    });
    it('should configure the project to use style argument', function () {
        var tree = schematicRunner.runSchematic('ng-new', { name: 'proj', packageManager: 'yarn', style: 'scss' }, projectTree);
        expect(JSON.parse(tree.readContent('/proj/angular.json')).schematics).toEqual({
            '@nrwl/schematics:application': {
                style: 'scss'
            },
            '@nrwl/schematics:library': {
                style: 'scss'
            }
        });
    });
});
