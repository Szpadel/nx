"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular-devkit/schematics/testing");
var path = require("path");
var schematics_1 = require("@angular-devkit/schematics");
var testing_utils_1 = require("../../utils/testing-utils");
var test_1 = require("@schematics/angular/utility/test");
var stripJsonComments = require("strip-json-comments");
var ast_utils_1 = require("../../utils/ast-utils");
describe('lib', function () {
    var schematicRunner = new testing_1.SchematicTestRunner('@nrwl/schematics', path.join(__dirname, '../../collection.json'));
    var appTree;
    beforeEach(function () {
        appTree = new schematics_1.VirtualTree();
        appTree = testing_utils_1.createEmptyWorkspace(appTree);
    });
    describe('not nested', function () {
        it('should update ng-package.json', function () {
            var publishableTree = schematicRunner.runSchematic('lib', { name: 'myLib', publishable: true }, appTree);
            var ngPackage = ast_utils_1.readJsonInTree(publishableTree, 'libs/my-lib/ng-package.json');
            expect(ngPackage.dest).toEqual('../../dist/libs/my-lib');
        });
        it('should not update package.json by default', function () {
            var tree = schematicRunner.runSchematic('lib', { name: 'myLib' }, appTree);
            var packageJson = ast_utils_1.readJsonInTree(tree, '/package.json');
            expect(packageJson.devDependencies['ng-packagr']).toBeUndefined();
        });
        it('should update package.json when publishable', function () {
            var tree = schematicRunner.runSchematic('lib', { name: 'myLib', publishable: true }, appTree);
            var packageJson = ast_utils_1.readJsonInTree(tree, '/package.json');
            expect(packageJson.devDependencies['ng-packagr']).toBeDefined();
        });
        it("should update npmScope of lib's package.json when publishable", function () {
            var tree = schematicRunner.runSchematic('lib', { name: 'myLib', publishable: true }, appTree);
            var packageJson = ast_utils_1.readJsonInTree(tree, '/libs/my-lib/package.json');
            expect(packageJson.name).toEqual('@proj/my-lib');
        });
        it("should update npmScope of lib's package.json when publishable", function () {
            var tree = schematicRunner.runSchematic('lib', { name: 'myLib', publishable: true, prefix: 'lib' }, appTree);
            var packageJson = ast_utils_1.readJsonInTree(tree, '/libs/my-lib/package.json');
            expect(packageJson.name).toEqual('@proj/my-lib');
        });
        it('should update angular.json', function () {
            var tree = schematicRunner.runSchematic('lib', { name: 'myLib', publishable: true }, appTree);
            var angularJson = ast_utils_1.readJsonInTree(tree, '/angular.json');
            expect(angularJson.projects['my-lib'].root).toEqual('libs/my-lib');
            expect(angularJson.projects['my-lib'].architect.build).toBeDefined();
        });
        it('should remove "build" target from angular.json when a library is not publishable', function () {
            var tree = schematicRunner.runSchematic('lib', { name: 'myLib', publishable: false }, appTree);
            var angularJson = ast_utils_1.readJsonInTree(tree, '/angular.json');
            expect(angularJson.projects['my-lib'].root).toEqual('libs/my-lib');
            expect(angularJson.projects['my-lib'].architect.build).not.toBeDefined();
        });
        it('should update nx.json', function () {
            var tree = schematicRunner.runSchematic('lib', { name: 'myLib', tags: 'one,two' }, appTree);
            var nxJson = ast_utils_1.readJsonInTree(tree, '/nx.json');
            expect(nxJson).toEqual({
                npmScope: 'proj',
                projects: {
                    'my-lib': {
                        tags: ['one', 'two']
                    }
                }
            });
        });
        it('should update root tsconfig.json', function () {
            var tree = schematicRunner.runSchematic('lib', { name: 'myLib' }, appTree);
            var tsconfigJson = ast_utils_1.readJsonInTree(tree, '/tsconfig.json');
            expect(tsconfigJson.compilerOptions.paths['@proj/my-lib']).toEqual([
                'libs/my-lib/src/index.ts'
            ]);
        });
        it('should create a local tsconfig.json', function () {
            var tree = schematicRunner.runSchematic('lib', { name: 'myLib' }, appTree);
            var tsconfigJson = ast_utils_1.readJsonInTree(tree, 'libs/my-lib/tsconfig.json');
            expect(tsconfigJson).toEqual({
                extends: '../../tsconfig.json',
                compilerOptions: {
                    types: ['jasmine']
                },
                include: ['**/*.ts']
            });
        });
        it('should extend the local tsconfig.json with tsconfig.spec.json', function () {
            var tree = schematicRunner.runSchematic('lib', { name: 'myLib' }, appTree);
            var tsconfigJson = ast_utils_1.readJsonInTree(tree, 'libs/my-lib/tsconfig.spec.json');
            expect(tsconfigJson.extends).toEqual('./tsconfig.json');
        });
        it('should extend the local tsconfig.json with tsconfig.lib.json', function () {
            var tree = schematicRunner.runSchematic('lib', { name: 'myLib' }, appTree);
            var tsconfigJson = ast_utils_1.readJsonInTree(tree, 'libs/my-lib/tsconfig.lib.json');
            expect(tsconfigJson.extends).toEqual('./tsconfig.json');
        });
        it('should generate files', function () {
            var tree = schematicRunner.runSchematic('lib', { name: 'myLib' }, appTree);
            expect(tree.exists("libs/my-lib/karma.conf.js")).toBeTruthy();
            expect(tree.exists('libs/my-lib/src/index.ts')).toBeTruthy();
            expect(tree.exists('libs/my-lib/src/lib/my-lib.module.ts')).toBeTruthy();
            expect(tree.exists('libs/my-lib/src/lib/my-lib.component.ts')).toBeFalsy();
            expect(tree.exists('libs/my-lib/src/lib/my-lib.component.spec.ts')).toBeFalsy();
            expect(tree.exists('libs/my-lib/src/lib/my-lib.service.ts')).toBeFalsy();
            expect(tree.exists('libs/my-lib/src/lib/my-lib.service.spec.ts')).toBeFalsy();
            var tree2 = schematicRunner.runSchematic('lib', { name: 'myLib2', simpleModuleName: true }, tree);
            expect(tree2.exists("libs/my-lib2/karma.conf.js")).toBeTruthy();
            expect(tree2.exists('libs/my-lib2/src/index.ts')).toBeTruthy();
            expect(tree2.exists('libs/my-lib2/src/lib/my-lib2.module.ts')).toBeTruthy();
            expect(tree.exists('libs/my-lib2/src/lib/my-lib2.component.ts')).toBeFalsy();
            expect(tree.exists('libs/my-lib2/src/lib/my-lib2.component.spec.ts')).toBeFalsy();
            expect(tree2.exists('libs/my-lib2/src/lib/my-lib2.service.ts')).toBeFalsy();
            expect(tree2.exists('libs/my-lib2/src/lib/my-lib2.service.spec.ts')).toBeFalsy();
        });
        it('should not generate a module for --module false', function () {
            var tree = schematicRunner.runSchematic('lib', { name: 'myLib', module: false }, appTree);
            expect(tree.exists('libs/my-lib/src/lib/my-lib.module.ts')).toEqual(false);
            expect(tree.exists('libs/my-lib/src/lib/my-lib.module.spec.ts')).toEqual(false);
            expect(tree.exists('libs/my-lib/src/lib/.gitkeep')).toEqual(true);
        });
        it('should default the prefix to npmScope', function () {
            var noPrefix = schematicRunner.runSchematic('lib', { name: 'myLib' }, appTree);
            expect(JSON.parse(noPrefix.read('angular.json').toString()).projects['my-lib']
                .prefix).toEqual('proj');
            var withPrefix = schematicRunner.runSchematic('app', { name: 'myLib', prefix: 'custom' }, appTree);
            expect(JSON.parse(withPrefix.read('angular.json').toString()).projects['my-lib'].prefix).toEqual('custom');
        });
    });
    describe('nested', function () {
        it('should update nx.json', function () {
            var tree = schematicRunner.runSchematic('lib', { name: 'myLib', directory: 'myDir', tags: 'one' }, appTree);
            var nxJson = ast_utils_1.readJsonInTree(tree, '/nx.json');
            expect(nxJson).toEqual({
                npmScope: 'proj',
                projects: {
                    'my-dir-my-lib': {
                        tags: ['one']
                    }
                }
            });
            var tree2 = schematicRunner.runSchematic('lib', {
                name: 'myLib2',
                directory: 'myDir',
                tags: 'one,two',
                simpleModuleName: true
            }, tree);
            var nxJson2 = ast_utils_1.readJsonInTree(tree2, '/nx.json');
            expect(nxJson2).toEqual({
                npmScope: 'proj',
                projects: {
                    'my-dir-my-lib': {
                        tags: ['one']
                    },
                    'my-dir-my-lib2': {
                        tags: ['one', 'two']
                    }
                }
            });
        });
        it('should generate files', function () {
            var tree = schematicRunner.runSchematic('lib', { name: 'myLib', directory: 'myDir' }, appTree);
            expect(tree.exists("libs/my-dir/my-lib/karma.conf.js")).toBeTruthy();
            expect(tree.exists('libs/my-dir/my-lib/src/index.ts')).toBeTruthy();
            expect(tree.exists('libs/my-dir/my-lib/src/lib/my-dir-my-lib.module.ts')).toBeTruthy();
            expect(tree.exists('libs/my-dir/my-lib/src/lib/my-lib.component.ts')).toBeFalsy();
            expect(tree.exists('libs/my-dir/my-lib/src/lib/my-lib.component.spec.ts')).toBeFalsy();
            expect(tree.exists('libs/my-dir/my-lib/src/lib/my-lib.service.ts')).toBeFalsy();
            expect(tree.exists('libs/my-dir/my-lib/src/lib/my-lib.service.spec.ts')).toBeFalsy();
            var tree2 = schematicRunner.runSchematic('lib', { name: 'myLib2', directory: 'myDir', simpleModuleName: true }, tree);
            expect(tree2.exists("libs/my-dir/my-lib2/karma.conf.js")).toBeTruthy();
            expect(tree2.exists('libs/my-dir/my-lib2/src/index.ts')).toBeTruthy();
            expect(tree2.exists('libs/my-dir/my-lib2/src/lib/my-lib2.module.ts')).toBeTruthy();
            expect(tree2.exists('libs/my-dir/my-lib2/src/lib/my-lib2.component.ts')).toBeFalsy();
            expect(tree2.exists('libs/my-dir/my-lib2/src/lib/my-lib2.component.spec.ts')).toBeFalsy();
            expect(tree2.exists('libs/my-dir/my-lib2/src/lib/my-lib2.service.ts')).toBeFalsy();
            expect(tree2.exists('libs/my-dir/my-lib2/src/lib/my-lib2.service.spec.ts')).toBeFalsy();
        });
        it('should update ng-package.json', function () {
            var publishableTree = schematicRunner.runSchematic('lib', { name: 'myLib', directory: 'myDir', publishable: true }, appTree);
            var ngPackage = ast_utils_1.readJsonInTree(publishableTree, 'libs/my-dir/my-lib/ng-package.json');
            expect(ngPackage.dest).toEqual('../../../dist/libs/my-dir/my-lib');
        });
        it('should update angular.json', function () {
            var tree = schematicRunner.runSchematic('lib', { name: 'myLib', directory: 'myDir' }, appTree);
            var angularJson = ast_utils_1.readJsonInTree(tree, '/angular.json');
            expect(angularJson.projects['my-dir-my-lib'].root).toEqual('libs/my-dir/my-lib');
        });
        it('should update tsconfig.json', function () {
            var tree = schematicRunner.runSchematic('lib', { name: 'myLib', directory: 'myDir' }, appTree);
            var tsconfigJson = ast_utils_1.readJsonInTree(tree, '/tsconfig.json');
            expect(tsconfigJson.compilerOptions.paths['@proj/my-dir/my-lib']).toEqual(['libs/my-dir/my-lib/src/index.ts']);
            expect(tsconfigJson.compilerOptions.paths['my-dir-my-lib/*']).toBeUndefined();
        });
        it('should create a local tsconfig.json', function () {
            var tree = schematicRunner.runSchematic('lib', { name: 'myLib', directory: 'myDir' }, appTree);
            var tsconfigJson = ast_utils_1.readJsonInTree(tree, 'libs/my-dir/my-lib/tsconfig.json');
            expect(tsconfigJson).toEqual({
                extends: '../../../tsconfig.json',
                compilerOptions: {
                    types: ['jasmine']
                },
                include: ['**/*.ts']
            });
        });
        it('should not generate a module for --module false', function () {
            var tree = schematicRunner.runSchematic('lib', { name: 'myLib', directory: 'myDir', module: false }, appTree);
            expect(tree.exists('libs/my-dir/my-lib/src/lib/my-dir-my-lib.module.ts')).toEqual(false);
            expect(tree.exists('libs/my-dir/my-lib/src/lib/my-dir-my-lib.module.spec.ts')).toEqual(false);
            expect(tree.exists('libs/my-dir/my-lib/src/lib/.gitkeep')).toEqual(true);
        });
    });
    describe('router', function () {
        it('should error when lazy is set without routing', function () {
            expect(function () {
                return schematicRunner.runSchematic('lib', { name: 'myLib', lazy: true }, appTree);
            }).toThrow('routing must be set');
        });
        describe('lazy', function () {
            it('should add RouterModule.forChild', function () {
                var tree = schematicRunner.runSchematic('lib', { name: 'myLib', directory: 'myDir', routing: true, lazy: true }, appTree);
                expect(tree.exists('libs/my-dir/my-lib/src/lib/my-dir-my-lib.module.ts')).toBeTruthy();
                expect(test_1.getFileContent(tree, 'libs/my-dir/my-lib/src/lib/my-dir-my-lib.module.ts')).toContain('RouterModule.forChild');
                var tree2 = schematicRunner.runSchematic('lib', {
                    name: 'myLib2',
                    directory: 'myDir',
                    routing: true,
                    lazy: true,
                    simpleModuleName: true
                }, tree);
                expect(tree2.exists('libs/my-dir/my-lib2/src/lib/my-lib2.module.ts')).toBeTruthy();
                expect(test_1.getFileContent(tree2, 'libs/my-dir/my-lib2/src/lib/my-lib2.module.ts')).toContain('RouterModule.forChild');
            });
            it('should update the parent module', function () {
                appTree = testing_utils_1.createApp(appTree, 'myapp');
                var tree = schematicRunner.runSchematic('lib', {
                    name: 'myLib',
                    directory: 'myDir',
                    routing: true,
                    lazy: true,
                    parentModule: 'apps/myapp/src/app/app.module.ts'
                }, appTree);
                expect(test_1.getFileContent(tree, 'apps/myapp/src/app/app.module.ts')).toContain("RouterModule.forRoot([{path: 'my-dir-my-lib', loadChildren: '@proj/my-dir/my-lib#MyDirMyLibModule'}])");
                var tsConfigAppJson = JSON.parse(stripJsonComments(test_1.getFileContent(tree, 'apps/myapp/tsconfig.app.json')));
                expect(tsConfigAppJson.include).toEqual([
                    '**/*.ts',
                    '../../libs/my-dir/my-lib/src/index.ts'
                ]);
                var tree2 = schematicRunner.runSchematic('lib', {
                    name: 'myLib2',
                    directory: 'myDir',
                    routing: true,
                    lazy: true,
                    parentModule: 'apps/myapp/src/app/app.module.ts'
                }, tree);
                expect(test_1.getFileContent(tree2, 'apps/myapp/src/app/app.module.ts')).toContain("RouterModule.forRoot([{path: 'my-dir-my-lib', loadChildren: '@proj/my-dir/my-lib#MyDirMyLibModule'}, {path: 'my-dir-my-lib2', loadChildren: '@proj/my-dir/my-lib2#MyDirMyLib2Module'}])");
                var tsConfigAppJson2 = JSON.parse(stripJsonComments(test_1.getFileContent(tree2, 'apps/myapp/tsconfig.app.json')));
                expect(tsConfigAppJson2.include).toEqual([
                    '**/*.ts',
                    '../../libs/my-dir/my-lib/src/index.ts',
                    '../../libs/my-dir/my-lib2/src/index.ts'
                ]);
                var tree3 = schematicRunner.runSchematic('lib', {
                    name: 'myLib3',
                    directory: 'myDir',
                    routing: true,
                    lazy: true,
                    parentModule: 'apps/myapp/src/app/app.module.ts',
                    simpleModuleName: true
                }, tree2);
                expect(test_1.getFileContent(tree3, 'apps/myapp/src/app/app.module.ts')).toContain("RouterModule.forRoot([{path: 'my-dir-my-lib', loadChildren: '@proj/my-dir/my-lib#MyDirMyLibModule'}, {path: 'my-dir-my-lib2', loadChildren: '@proj/my-dir/my-lib2#MyDirMyLib2Module'}, {path: 'my-lib3', loadChildren: '@proj/my-dir/my-lib3#MyLib3Module'}])");
                var tsConfigAppJson3 = JSON.parse(stripJsonComments(test_1.getFileContent(tree3, 'apps/myapp/tsconfig.app.json')));
                expect(tsConfigAppJson3.include).toEqual([
                    '**/*.ts',
                    '../../libs/my-dir/my-lib/src/index.ts',
                    '../../libs/my-dir/my-lib2/src/index.ts',
                    '../../libs/my-dir/my-lib3/src/index.ts'
                ]);
            });
        });
        describe('eager', function () {
            it('should add RouterModule and define an array of routes', function () {
                var tree = schematicRunner.runSchematic('lib', { name: 'myLib', directory: 'myDir', routing: true }, appTree);
                expect(tree.exists('libs/my-dir/my-lib/src/lib/my-dir-my-lib.module.ts')).toBeTruthy();
                expect(test_1.getFileContent(tree, 'libs/my-dir/my-lib/src/lib/my-dir-my-lib.module.ts')).toContain('RouterModule');
                expect(test_1.getFileContent(tree, 'libs/my-dir/my-lib/src/lib/my-dir-my-lib.module.ts')).toContain('const myDirMyLibRoutes: Route[] = ');
                var tree2 = schematicRunner.runSchematic('lib', {
                    name: 'myLib2',
                    directory: 'myDir',
                    routing: true,
                    simpleModuleName: true
                }, tree);
                expect(tree2.exists('libs/my-dir/my-lib2/src/lib/my-lib2.module.ts')).toBeTruthy();
                expect(test_1.getFileContent(tree2, 'libs/my-dir/my-lib2/src/lib/my-lib2.module.ts')).toContain('RouterModule');
                expect(test_1.getFileContent(tree2, 'libs/my-dir/my-lib2/src/lib/my-lib2.module.ts')).toContain('const myLib2Routes: Route[] = ');
            });
            it('should update the parent module', function () {
                appTree = testing_utils_1.createApp(appTree, 'myapp');
                var tree = schematicRunner.runSchematic('lib', {
                    name: 'myLib',
                    directory: 'myDir',
                    routing: true,
                    parentModule: 'apps/myapp/src/app/app.module.ts'
                }, appTree);
                expect(test_1.getFileContent(tree, 'apps/myapp/src/app/app.module.ts')).toContain("RouterModule.forRoot([{path: 'my-dir-my-lib', children: myDirMyLibRoutes}])");
                var tree2 = schematicRunner.runSchematic('lib', {
                    name: 'myLib2',
                    directory: 'myDir',
                    routing: true,
                    parentModule: 'apps/myapp/src/app/app.module.ts'
                }, tree);
                expect(test_1.getFileContent(tree2, 'apps/myapp/src/app/app.module.ts')).toContain("RouterModule.forRoot([{path: 'my-dir-my-lib', children: myDirMyLibRoutes}, {path: 'my-dir-my-lib2', children: myDirMyLib2Routes}])");
                var tree3 = schematicRunner.runSchematic('lib', {
                    name: 'myLib3',
                    directory: 'myDir',
                    routing: true,
                    parentModule: 'apps/myapp/src/app/app.module.ts',
                    simpleModuleName: true
                }, tree2);
                expect(test_1.getFileContent(tree3, 'apps/myapp/src/app/app.module.ts')).toContain("RouterModule.forRoot([{path: 'my-dir-my-lib', children: myDirMyLibRoutes}, {path: 'my-dir-my-lib2', children: myDirMyLib2Routes}, {path: 'my-lib3', children: myLib3Routes}])");
            });
        });
    });
    describe('--style scss', function () {
        it('should set it as default', function () {
            var result = schematicRunner.runSchematic('lib', { name: 'myLib', style: 'scss' }, appTree);
            var angularJson = ast_utils_1.readJsonInTree(result, 'angular.json');
            expect(angularJson.projects['my-lib'].schematics).toEqual({
                '@nrwl/schematics:component': {
                    styleext: 'scss'
                }
            });
        });
    });
    describe('--unit-test-runner jest', function () {
        it('should generate jest configuration', function () {
            var resultTree = schematicRunner.runSchematic('lib', { name: 'myLib', unitTestRunner: 'jest' }, appTree);
            expect(resultTree.exists('libs/my-lib/src/test.ts')).toBeFalsy();
            expect(resultTree.exists('libs/my-lib/src/test-setup.ts')).toBeTruthy();
            expect(resultTree.exists('libs/my-lib/tsconfig.spec.json')).toBeTruthy();
            expect(resultTree.exists('libs/my-lib/jest.config.js')).toBeTruthy();
            var angularJson = ast_utils_1.readJsonInTree(resultTree, 'angular.json');
            expect(angularJson.projects['my-lib'].architect.test.builder).toEqual('@nrwl/builders:jest');
            expect(angularJson.projects['my-lib'].architect.lint.options.tsConfig).toEqual([
                'libs/my-lib/tsconfig.lib.json',
                'libs/my-lib/tsconfig.spec.json'
            ]);
        });
        it('should skip the setup file if no module is generated', function () {
            var resultTree = schematicRunner.runSchematic('lib', { name: 'myLib', unitTestRunner: 'jest', module: false }, appTree);
            expect(resultTree.exists('libs/my-lib/src/test-setup.ts')).toBeFalsy();
        });
    });
    describe('--unit-test-runner none', function () {
        it('should not generate test configuration', function () {
            var resultTree = schematicRunner.runSchematic('lib', { name: 'myLib', unitTestRunner: 'none' }, appTree);
            expect(resultTree.exists('libs/my-lib/src/lib/my-lib.module.spec.ts')).toBeFalsy();
            expect(resultTree.exists('libs/my-lib/src/test.ts')).toBeFalsy();
            expect(resultTree.exists('libs/my-lib/src/test.ts')).toBeFalsy();
            expect(resultTree.exists('libs/my-lib/tsconfig.spec.json')).toBeFalsy();
            expect(resultTree.exists('libs/my-lib/jest.config.js')).toBeFalsy();
            expect(resultTree.exists('libs/my-lib/karma.config.js')).toBeFalsy();
            var angularJson = ast_utils_1.readJsonInTree(resultTree, 'angular.json');
            expect(angularJson.projects['my-lib'].architect.test).toBeUndefined();
            expect(angularJson.projects['my-lib'].architect.lint.options.tsConfig).toEqual(['libs/my-lib/tsconfig.lib.json']);
        });
    });
});
