"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular-devkit/schematics/testing");
var path = require("path");
var schematics_1 = require("@angular-devkit/schematics");
var testing_utils_1 = require("../../utils/testing-utils");
describe('workspace-schematic', function () {
    var schematicRunner = new testing_1.SchematicTestRunner('@nrwl/schematics', path.join(__dirname, '../../collection.json'));
    var appTree;
    beforeEach(function () {
        appTree = new schematics_1.VirtualTree();
        appTree = testing_utils_1.createEmptyWorkspace(appTree);
    });
    it('should generate files', function () {
        var tree = schematicRunner.runSchematic('workspace-schematic', { name: 'custom' }, appTree);
        expect(tree.exists('tools/schematics/custom/index.ts')).toBeTruthy();
        expect(tree.exists('tools/schematics/custom/schema.json')).toBeTruthy();
    });
});
