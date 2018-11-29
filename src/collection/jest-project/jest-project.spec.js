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
        appTree = schematicRunner.runSchematic('lib', {
            name: 'lib1',
            unitTestRunner: 'none'
        }, appTree);
    });
    it('should generate files', function () {
        var resultTree = schematicRunner.runSchematic('jest-project', {
            project: 'lib1'
        }, appTree);
        expect(resultTree.exists('/libs/lib1/src/test-setup.ts')).toBeTruthy();
        expect(resultTree.exists('/libs/lib1/jest.config.js')).toBeTruthy();
        expect(resultTree.exists('/libs/lib1/tsconfig.spec.json')).toBeTruthy();
    });
    it('should alter angular.json', function () {
        var resultTree = schematicRunner.runSchematic('jest-project', {
            project: 'lib1'
        }, appTree);
        var angularJson = ast_utils_1.readJsonInTree(resultTree, 'angular.json');
        expect(angularJson.projects.lib1.architect.test).toEqual({
            builder: '@nrwl/builders:jest',
            options: {
                jestConfig: 'libs/lib1/jest.config.js',
                setupFile: 'libs/lib1/src/test-setup.ts',
                tsConfig: 'libs/lib1/tsconfig.spec.json'
            }
        });
        expect(angularJson.projects.lib1.architect.lint.options.tsConfig).toContain('libs/lib1/tsconfig.spec.json');
    });
    it('should create a jest.config.js', function () {
        var resultTree = schematicRunner.runSchematic('jest-project', {
            project: 'lib1'
        }, appTree);
        expect(resultTree.readContent('libs/lib1/jest.config.js'))
            .toBe("module.exports = {\n  name: 'lib1',\n  preset: '../../jest.config.js',\n  coverageDirectory: '../../coverage/libs/lib1'\n};\n");
    });
    it('should update the local tsconfig.json', function () {
        var resultTree = schematicRunner.runSchematic('jest-project', {
            project: 'lib1'
        }, appTree);
        var tsConfig = ast_utils_1.readJsonInTree(resultTree, 'libs/lib1/tsconfig.json');
        expect(tsConfig.compilerOptions.types).toContain('jest');
        expect(tsConfig.compilerOptions.types).toContain('node');
    });
    it('should create a tsconfig.spec.json', function () {
        var resultTree = schematicRunner.runSchematic('jest-project', {
            project: 'lib1'
        }, appTree);
        var tsConfig = ast_utils_1.readJsonInTree(resultTree, 'libs/lib1/tsconfig.spec.json');
        expect(tsConfig).toEqual({
            extends: './tsconfig.json',
            compilerOptions: {
                module: 'commonjs',
                outDir: '../../dist/out-tsc/libs/lib1',
                types: ['jest', 'node']
            },
            files: ['src/test-setup.ts'],
            include: ['**/*.spec.ts', '**/*.d.ts']
        });
    });
    describe('--skip-setup-file', function () {
        it('should generate src/test-setup.ts', function () {
            var resultTree = schematicRunner.runSchematic('jest-project', {
                project: 'lib1',
                skipSetupFile: true
            }, appTree);
            expect(resultTree.exists('src/test-setup.ts')).toBeFalsy();
        });
        it('should not list the setup file in angular.json', function () {
            var resultTree = schematicRunner.runSchematic('jest-project', {
                project: 'lib1',
                skipSetupFile: true
            }, appTree);
            var angularJson = ast_utils_1.readJsonInTree(resultTree, 'angular.json');
            expect(angularJson.projects.lib1.architect.test.options.setupFile).toBeUndefined();
        });
        it('should not list the setup file in tsconfig.spec.json', function () {
            var resultTree = schematicRunner.runSchematic('jest-project', {
                project: 'lib1',
                skipSetupFile: true
            }, appTree);
            var tsConfig = ast_utils_1.readJsonInTree(resultTree, 'libs/lib1/tsconfig.spec.json');
            expect(tsConfig.files).toBeUndefined();
        });
    });
});
