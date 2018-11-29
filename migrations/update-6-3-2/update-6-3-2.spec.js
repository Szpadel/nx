"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var schematics_1 = require("@angular-devkit/schematics");
var testing_1 = require("@angular-devkit/schematics/testing");
var fileutils_1 = require("../../src/utils/fileutils");
var path = require("path");
describe('Update 6.2.0', function () {
    var initialTree;
    var schematicRunner;
    beforeEach(function () {
        initialTree = schematics_1.Tree.empty();
        initialTree.create('package.json', fileutils_1.serializeJson({
            devDependencies: {
                'jest-preset-angular': '6.0.0'
            }
        }));
        schematicRunner = new testing_1.SchematicTestRunner('@nrwl/schematics', path.join(__dirname, '../migrations.json'));
    });
    it('should update jest-preset-angular', function () {
        var result = schematicRunner.runSchematic('update-6.3.2', {}, initialTree);
        expect(JSON.parse(result.readContent('package.json'))).toEqual({
            devDependencies: {
                'jest-preset-angular': '6.0.1'
            }
        });
    });
    it('should not update jest-preset-angular if it does not exist', function () {
        initialTree.overwrite('package.json', fileutils_1.serializeJson({
            devDependencies: {}
        }));
        var result = schematicRunner.runSchematic('update-6.3.2', {}, initialTree);
        expect(JSON.parse(result.readContent('package.json'))).toEqual({
            devDependencies: {}
        });
    });
});
