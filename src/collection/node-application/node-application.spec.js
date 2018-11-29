"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular-devkit/schematics/testing");
var path = require("path");
var schematics_1 = require("@angular-devkit/schematics");
var testing_utils_1 = require("../../utils/testing-utils");
var test_1 = require("@schematics/angular/utility/test");
var stripJsonComments = require("strip-json-comments");
var ast_utils_1 = require("../../utils/ast-utils");
describe('node-app', function () {
    var schematicRunner = new testing_1.SchematicTestRunner('@nrwl/schematics', path.join(__dirname, '../../collection.json'));
    var appTree;
    beforeEach(function () {
        appTree = new schematics_1.VirtualTree();
        appTree = testing_utils_1.createEmptyWorkspace(appTree);
    });
    describe('not nested', function () {
        it('should update angular.json', function () {
            var tree = schematicRunner.runSchematic('node-app', { name: 'myNodeApp' }, appTree);
            var angularJson = ast_utils_1.readJsonInTree(tree, '/angular.json');
            var project = angularJson.projects['my-node-app'];
            expect(project.root).toEqual('apps/my-node-app');
            expect(project.architect).toEqual(jasmine.objectContaining({
                build: {
                    builder: '@nrwl/builders:node-build',
                    options: {
                        outputPath: 'dist/apps/my-node-app',
                        main: 'apps/my-node-app/src/main.ts',
                        tsConfig: 'apps/my-node-app/tsconfig.app.json',
                        assets: ['apps/my-node-app/src/assets']
                    },
                    configurations: {
                        production: {
                            optimization: true,
                            extractLicenses: true,
                            fileReplacements: [
                                {
                                    replace: 'apps/my-node-app/src/environments/environment.ts',
                                    with: 'apps/my-node-app/src/environments/environment.prod.ts'
                                }
                            ]
                        }
                    }
                },
                serve: {
                    builder: '@nrwl/builders:node-execute',
                    options: {
                        buildTarget: 'my-node-app:build'
                    }
                }
            }));
            expect(angularJson.projects['my-node-app-e2e']).toBeUndefined();
        });
        it('should update nx.json', function () {
            var tree = schematicRunner.runSchematic('node-app', { name: 'myNodeApp', tags: 'one,two' }, appTree);
            var nxJson = ast_utils_1.readJsonInTree(tree, '/nx.json');
            expect(nxJson).toEqual({
                npmScope: 'proj',
                projects: {
                    'my-node-app': {
                        tags: ['one', 'two']
                    }
                }
            });
        });
        it('should generate files', function () {
            var tree = schematicRunner.runSchematic('node-app', { name: 'myNodeApp' }, appTree);
            expect(tree.exists("apps/my-node-app/jest.config.js")).toBeTruthy();
            expect(tree.exists('apps/my-node-app/src/main.ts')).toBeTruthy();
            expect(tree.readContent('apps/my-node-app/src/main.ts')).toContain('const app = express();');
            expect(tree.readContent('apps/my-node-app/src/main.ts')).toContain('res.send(`Welcome to my-node-app!`);');
            var tsconfig = ast_utils_1.readJsonInTree(tree, 'apps/my-node-app/tsconfig.json');
            expect(tsconfig.extends).toEqual('../../tsconfig.json');
            expect(tsconfig.compilerOptions.types).toContain('node');
            expect(tsconfig.compilerOptions.types).toContain('express');
            expect(tsconfig.compilerOptions.types).toContain('jest');
            var tsconfigApp = JSON.parse(stripJsonComments(test_1.getFileContent(tree, 'apps/my-node-app/tsconfig.app.json')));
            expect(tsconfigApp.compilerOptions.outDir).toEqual('../../dist/out-tsc/apps/my-node-app');
            expect(tsconfigApp.extends).toEqual('./tsconfig.json');
            var tslintJson = JSON.parse(stripJsonComments(test_1.getFileContent(tree, 'apps/my-node-app/tslint.json')));
            expect(tslintJson.extends).toEqual('../../tslint.json');
        });
        it('should add dependencies', function () {
            var tree = schematicRunner.runSchematic('node-app', { name: 'myNodeApp' }, appTree);
            var packageJson = ast_utils_1.readJsonInTree(tree, 'package.json');
            expect(packageJson.dependencies.express).toBeDefined();
            expect(packageJson.devDependencies['@types/express']).toBeDefined();
        });
    });
    describe('nested', function () {
        it('should update angular.json', function () {
            var tree = schematicRunner.runSchematic('node-app', { name: 'myNodeApp', directory: 'myDir' }, appTree);
            var angularJson = ast_utils_1.readJsonInTree(tree, '/angular.json');
            expect(angularJson.projects['my-dir-my-node-app'].root).toEqual('apps/my-dir/my-node-app');
            expect(angularJson.projects['my-dir-my-node-app-e2e']).toBeUndefined();
        });
        it('should update nx.json', function () {
            var tree = schematicRunner.runSchematic('node-app', { name: 'myNodeApp', directory: 'myDir', tags: 'one,two' }, appTree);
            var nxJson = ast_utils_1.readJsonInTree(tree, '/nx.json');
            expect(nxJson).toEqual({
                npmScope: 'proj',
                projects: {
                    'my-dir-my-node-app': {
                        tags: ['one', 'two']
                    }
                }
            });
        });
        it('should generate files', function () {
            var hasJsonValue = function (_a) {
                var path = _a.path, expectedValue = _a.expectedValue, lookupFn = _a.lookupFn;
                var content = test_1.getFileContent(tree, path);
                var config = JSON.parse(stripJsonComments(content));
                expect(lookupFn(config)).toEqual(expectedValue);
            };
            var tree = schematicRunner.runSchematic('node-app', { name: 'myNodeApp', directory: 'myDir' }, appTree);
            // Make sure these exist
            [
                "apps/my-dir/my-node-app/jest.config.js",
                'apps/my-dir/my-node-app/src/main.ts'
            ].forEach(function (path) {
                expect(tree.exists(path)).toBeTruthy();
            });
            // Make sure these have properties
            [
                {
                    path: 'apps/my-dir/my-node-app/tsconfig.json',
                    lookupFn: function (json) { return json.extends; },
                    expectedValue: '../../../tsconfig.json'
                },
                {
                    path: 'apps/my-dir/my-node-app/tsconfig.app.json',
                    lookupFn: function (json) { return json.compilerOptions.outDir; },
                    expectedValue: '../../../dist/out-tsc/apps/my-dir/my-node-app'
                },
                {
                    path: 'apps/my-dir/my-node-app/tsconfig.app.json',
                    lookupFn: function (json) { return json.compilerOptions.types; },
                    expectedValue: ['node']
                },
                {
                    path: 'apps/my-dir/my-node-app/tslint.json',
                    lookupFn: function (json) { return json.extends; },
                    expectedValue: '../../../tslint.json'
                }
            ].forEach(hasJsonValue);
        });
    });
    describe('--unit-test-runner karma', function () {
        it('should be invalid', function () {
            expect(function () {
                schematicRunner.runSchematic('node-app', { name: 'myNodeApp', unitTestRunner: 'karma' }, appTree);
            }).toThrow();
        });
    });
    describe('--unit-test-runner none', function () {
        it('should not generate test configuration', function () {
            var tree = schematicRunner.runSchematic('node-app', { name: 'myNodeApp', unitTestRunner: 'none' }, appTree);
            expect(tree.exists('apps/my-node-app/src/test-setup.ts')).toBeFalsy();
            expect(tree.exists('apps/my-node-app/src/test.ts')).toBeFalsy();
            expect(tree.exists('apps/my-node-app/tsconfig.spec.json')).toBeFalsy();
            expect(tree.exists('apps/my-node-app/jest.config.js')).toBeFalsy();
            expect(tree.exists('apps/my-node-app/karma.config.js')).toBeFalsy();
            var angularJson = ast_utils_1.readJsonInTree(tree, 'angular.json');
            expect(angularJson.projects['my-node-app'].architect.test).toBeUndefined();
            expect(angularJson.projects['my-node-app'].architect.lint.options.tsConfig).toEqual(['apps/my-node-app/tsconfig.app.json']);
        });
    });
    describe('--framework none', function () {
        it('should not generate any files', function () {
            var tree = schematicRunner.runSchematic('node-app', { name: 'myNodeApp', framework: 'none' }, appTree);
            expect(tree.exists('apps/my-node-app/src/main.ts')).toBeFalsy();
            expect(tree.exists('apps/my-node-app/src/app/.gitkeep')).toBeTruthy();
        });
    });
});
