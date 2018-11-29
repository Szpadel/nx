"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular-devkit/schematics/testing");
var path = require("path");
var schematics_1 = require("@angular-devkit/schematics");
var testing_utils_1 = require("../../utils/testing-utils");
var ast_utils_1 = require("@nrwl/schematics/src/utils/ast-utils");
describe('lib', function () {
    var schematicRunner = new testing_1.SchematicTestRunner('@nrwl/schematics', path.join(__dirname, '../../collection.json'));
    var appTree;
    beforeEach(function () {
        appTree = new schematics_1.VirtualTree();
        appTree = testing_utils_1.createEmptyWorkspace(appTree);
    });
    it('should generate files', function () {
        var resultTree = schematicRunner.runSchematic('jest', {}, appTree);
        expect(resultTree.exists('jest.config.js')).toBeTruthy();
    });
    it('should add dependencies', function () {
        var resultTree = schematicRunner.runSchematic('jest', {}, appTree);
        var packageJson = ast_utils_1.readJsonInTree(resultTree, 'package.json');
        expect(packageJson.devDependencies.jest).toBeDefined();
        expect(packageJson.devDependencies['@nrwl/builders']).toBeDefined();
        expect(packageJson.devDependencies['@types/jest']).toBeDefined();
        expect(packageJson.devDependencies['jest-preset-angular']).toBeDefined();
    });
});
