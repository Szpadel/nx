"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular-devkit/schematics/testing");
var path = require("path");
var schematics_1 = require("@angular-devkit/schematics");
var testing_utils_1 = require("../../utils/testing-utils");
var test_1 = require("@schematics/angular/utility/test");
var stripJsonComments = require("strip-json-comments");
var ast_utils_1 = require("../../utils/ast-utils");
describe('app', function () {
    var schematicRunner = new testing_1.SchematicTestRunner('@nrwl/schematics', path.join(__dirname, '../../collection.json'));
    var appTree;
    beforeEach(function () {
        appTree = new schematics_1.VirtualTree();
        appTree = testing_utils_1.createEmptyWorkspace(appTree);
    });
    describe('not nested', function () {
        it('should update angular.json', function () {
            var tree = schematicRunner.runSchematic('app', { name: 'myApp' }, appTree);
            var angularJson = ast_utils_1.readJsonInTree(tree, '/angular.json');
            expect(angularJson.projects['my-app'].root).toEqual('apps/my-app/');
            expect(angularJson.projects['my-app-e2e'].root).toEqual('apps/my-app-e2e');
        });
        it('should update nx.json', function () {
            var tree = schematicRunner.runSchematic('app', { name: 'myApp', tags: 'one,two' }, appTree);
            var nxJson = ast_utils_1.readJsonInTree(tree, '/nx.json');
            expect(nxJson).toEqual({
                npmScope: 'proj',
                projects: {
                    'my-app': {
                        tags: ['one', 'two']
                    },
                    'my-app-e2e': {
                        tags: []
                    }
                }
            });
        });
        it('should generate files', function () {
            var tree = schematicRunner.runSchematic('app', { name: 'myApp' }, appTree);
            expect(tree.exists("apps/my-app/karma.conf.js")).toBeTruthy();
            expect(tree.exists('apps/my-app/src/main.ts')).toBeTruthy();
            expect(tree.exists('apps/my-app/src/app/app.module.ts')).toBeTruthy();
            expect(tree.exists('apps/my-app/src/app/app.component.ts')).toBeTruthy();
            expect(test_1.getFileContent(tree, 'apps/my-app/src/app/app.module.ts')).toContain('class AppModule');
            var tsconfig = ast_utils_1.readJsonInTree(tree, 'apps/my-app/tsconfig.json');
            expect(tsconfig.extends).toEqual('../../tsconfig.json');
            expect(tsconfig.compilerOptions.types).toContain('jasmine');
            var tsconfigApp = JSON.parse(stripJsonComments(test_1.getFileContent(tree, 'apps/my-app/tsconfig.app.json')));
            expect(tsconfigApp.compilerOptions.outDir).toEqual('../../dist/out-tsc/apps/my-app');
            expect(tsconfigApp.extends).toEqual('./tsconfig.json');
            var tslintJson = JSON.parse(stripJsonComments(test_1.getFileContent(tree, 'apps/my-app/tslint.json')));
            expect(tslintJson.extends).toEqual('../../tslint.json');
            expect(tree.exists('apps/my-app-e2e/src/app.po.ts')).toBeTruthy();
            var tsconfigE2E = JSON.parse(stripJsonComments(test_1.getFileContent(tree, 'apps/my-app-e2e/tsconfig.e2e.json')));
            expect(tsconfigE2E.compilerOptions.outDir).toEqual('../../dist/out-tsc/apps/my-app-e2e');
            expect(tsconfigE2E.extends).toEqual('./tsconfig.json');
        });
        it('should default the prefix to npmScope', function () {
            var noPrefix = schematicRunner.runSchematic('app', { name: 'myApp' }, appTree);
            var withPrefix = schematicRunner.runSchematic('app', { name: 'myApp', prefix: 'custom' }, appTree);
            // Testing without prefix
            var appE2eSpec = noPrefix
                .read('apps/my-app-e2e/src/app.e2e-spec.ts')
                .toString();
            var angularJson = JSON.parse(noPrefix.read('angular.json').toString());
            var myAppPrefix = angularJson.projects['my-app'].prefix;
            expect(myAppPrefix).toEqual('proj');
            expect(appE2eSpec).toContain('Welcome to my-app!');
            // Testing WITH prefix
            appE2eSpec = withPrefix
                .read('apps/my-app-e2e/src/app.e2e-spec.ts')
                .toString();
            angularJson = JSON.parse(withPrefix.read('angular.json').toString());
            myAppPrefix = angularJson.projects['my-app'].prefix;
            expect(myAppPrefix).toEqual('custom');
            expect(appE2eSpec).toContain('Welcome to my-app!');
        });
        it('should work if the new project root is changed', function () { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, schematicRunner
                            .callRule(ast_utils_1.updateJsonInTree('/angular.json', function (json) { return (__assign({}, json, { newProjectRoot: 'newProjectRoot' })); }), appTree)
                            .toPromise()];
                    case 1:
                        appTree = _a.sent();
                        result = schematicRunner.runSchematic('app', { name: 'myApp' }, appTree);
                        expect(result.exists('apps/my-app/src/main.ts')).toEqual(true);
                        expect(result.exists('apps/my-app-e2e/protractor.conf.js')).toEqual(true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('nested', function () {
        it('should update angular.json', function () {
            var tree = schematicRunner.runSchematic('app', { name: 'myApp', directory: 'myDir' }, appTree);
            var angularJson = ast_utils_1.readJsonInTree(tree, '/angular.json');
            expect(angularJson.projects['my-dir-my-app'].root).toEqual('apps/my-dir/my-app/');
            expect(angularJson.projects['my-dir-my-app-e2e'].root).toEqual('apps/my-dir/my-app-e2e');
        });
        it('should update nx.json', function () {
            var tree = schematicRunner.runSchematic('app', { name: 'myApp', directory: 'myDir', tags: 'one,two' }, appTree);
            var nxJson = ast_utils_1.readJsonInTree(tree, '/nx.json');
            expect(nxJson).toEqual({
                npmScope: 'proj',
                projects: {
                    'my-dir-my-app': {
                        tags: ['one', 'two']
                    },
                    'my-dir-my-app-e2e': {
                        tags: []
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
            var tree = schematicRunner.runSchematic('app', { name: 'myApp', directory: 'myDir' }, appTree);
            var appModulePath = 'apps/my-dir/my-app/src/app/app.module.ts';
            expect(test_1.getFileContent(tree, appModulePath)).toContain('class AppModule');
            // Make sure these exist
            [
                "apps/my-dir/my-app/karma.conf.js",
                'apps/my-dir/my-app/src/main.ts',
                'apps/my-dir/my-app/src/app/app.module.ts',
                'apps/my-dir/my-app/src/app/app.component.ts',
                'apps/my-dir/my-app-e2e/src/app.po.ts'
            ].forEach(function (path) {
                expect(tree.exists(path)).toBeTruthy();
            });
            // Make sure these have properties
            [
                {
                    path: 'apps/my-dir/my-app/tsconfig.json',
                    lookupFn: function (json) { return json.extends; },
                    expectedValue: '../../../tsconfig.json'
                },
                {
                    path: 'apps/my-dir/my-app/tsconfig.app.json',
                    lookupFn: function (json) { return json.compilerOptions.outDir; },
                    expectedValue: '../../../dist/out-tsc/apps/my-dir/my-app'
                },
                {
                    path: 'apps/my-dir/my-app-e2e/tsconfig.json',
                    lookupFn: function (json) { return json.extends; },
                    expectedValue: '../../../tsconfig.json'
                },
                {
                    path: 'apps/my-dir/my-app-e2e/tsconfig.e2e.json',
                    lookupFn: function (json) { return json.compilerOptions.outDir; },
                    expectedValue: '../../../dist/out-tsc/apps/my-dir/my-app-e2e'
                },
                {
                    path: 'apps/my-dir/my-app/tslint.json',
                    lookupFn: function (json) { return json.extends; },
                    expectedValue: '../../../tslint.json'
                }
            ].forEach(hasJsonValue);
        });
    });
    it('should import NgModule', function () {
        var tree = schematicRunner.runSchematic('app', { name: 'myApp', directory: 'myDir' }, appTree);
        expect(test_1.getFileContent(tree, 'apps/my-dir/my-app/src/app/app.module.ts')).toContain('NxModule.forRoot()');
    });
    describe('routing', function () {
        it('should include RouterTestingModule', function () {
            var tree = schematicRunner.runSchematic('app', { name: 'myApp', directory: 'myDir', routing: true }, appTree);
            expect(test_1.getFileContent(tree, 'apps/my-dir/my-app/src/app/app.module.ts')).toContain('RouterModule.forRoot');
            expect(test_1.getFileContent(tree, 'apps/my-dir/my-app/src/app/app.component.spec.ts')).toContain('imports: [RouterTestingModule]');
        });
        it('should not modify tests when --skip-tests is set', function () {
            var tree = schematicRunner.runSchematic('app', { name: 'myApp', directory: 'myDir', routing: true, skipTests: true }, appTree);
            expect(tree.exists('apps/my-dir/my-app/src/app/app.component.spec.ts')).toBeFalsy();
        });
    });
    describe('template generation mode', function () {
        it('should create Nx specific `app.component.html` template', function () {
            var tree = schematicRunner.runSchematic('app', { name: 'myApp', directory: 'myDir' }, appTree);
            expect(test_1.getFileContent(tree, 'apps/my-dir/my-app/src/app/app.component.html')).toBeTruthy();
            expect(test_1.getFileContent(tree, 'apps/my-dir/my-app/src/app/app.component.html')).toContain('This is an Angular CLI app built with Nrwl Nx!');
        });
        it("should update `template`'s property of AppComponent with Nx content", function () {
            var tree = schematicRunner.runSchematic('app', { name: 'myApp', directory: 'myDir', inlineTemplate: true }, appTree);
            expect(test_1.getFileContent(tree, 'apps/my-dir/my-app/src/app/app.component.ts')).toContain('This is an Angular CLI app built with Nrwl Nx!');
        });
    });
    describe('--style scss', function () {
        it('should generate scss styles', function () {
            var result = schematicRunner.runSchematic('app', { name: 'myApp', style: 'scss' }, appTree);
            expect(result.exists('apps/my-app/src/app/app.component.scss')).toEqual(true);
        });
        it('should set it as default', function () {
            var result = schematicRunner.runSchematic('app', { name: 'myApp', style: 'scss' }, appTree);
            var angularJson = ast_utils_1.readJsonInTree(result, 'angular.json');
            expect(angularJson.projects['my-app'].schematics).toEqual({
                '@nrwl/schematics:component': {
                    styleext: 'scss'
                }
            });
        });
    });
    describe('--unit-test-runner jest', function () {
        it('should generate a jest config', function () {
            var tree = schematicRunner.runSchematic('app', { name: 'myApp', unitTestRunner: 'jest' }, appTree);
            expect(tree.exists('apps/my-app/src/test.ts')).toBeFalsy();
            expect(tree.exists('apps/my-app/src/test-setup.ts')).toBeTruthy();
            expect(tree.exists('apps/my-app/tsconfig.spec.json')).toBeTruthy();
            expect(tree.exists('apps/my-app/jest.config.js')).toBeTruthy();
            var angularJson = ast_utils_1.readJsonInTree(tree, 'angular.json');
            expect(angularJson.projects['my-app'].architect.test.builder).toEqual('@nrwl/builders:jest');
            expect(angularJson.projects['my-app'].architect.lint.options.tsConfig).toEqual([
                'apps/my-app/tsconfig.app.json',
                'apps/my-app/tsconfig.spec.json'
            ]);
            var tsconfigAppJson = ast_utils_1.readJsonInTree(tree, 'apps/my-app/tsconfig.app.json');
            expect(tsconfigAppJson.exclude).toEqual([
                'src/test-setup.ts',
                '**/*.spec.ts'
            ]);
            expect(tsconfigAppJson.compilerOptions.outDir).toEqual('../../dist/out-tsc/apps/my-app');
        });
    });
    describe('--unit-test-runner none', function () {
        it('should not generate test configuration', function () {
            var tree = schematicRunner.runSchematic('app', { name: 'myApp', unitTestRunner: 'none' }, appTree);
            expect(tree.exists('apps/my-app/src/test-setup.ts')).toBeFalsy();
            expect(tree.exists('apps/my-app/src/test.ts')).toBeFalsy();
            expect(tree.exists('apps/my-app/tsconfig.spec.json')).toBeFalsy();
            expect(tree.exists('apps/my-app/jest.config.js')).toBeFalsy();
            expect(tree.exists('apps/my-app/karma.config.js')).toBeFalsy();
            var angularJson = ast_utils_1.readJsonInTree(tree, 'angular.json');
            expect(angularJson.projects['my-app'].architect.test).toBeUndefined();
            expect(angularJson.projects['my-app'].architect.lint.options.tsConfig).toEqual(['apps/my-app/tsconfig.app.json']);
        });
    });
    describe('--e2e-test-runner none', function () {
        it('should not generate test configuration', function () {
            var tree = schematicRunner.runSchematic('app', { name: 'myApp', e2eTestRunner: 'none' }, appTree);
            expect(tree.exists('apps/my-app-e2e')).toBeFalsy();
            var angularJson = ast_utils_1.readJsonInTree(tree, 'angular.json');
            expect(angularJson.projects['my-app-e2e']).toBeUndefined();
        });
    });
    describe('replaceAppNameWithPath', function () {
        it('should protect `angular.json` commands and properties', function () {
            var tree = schematicRunner.runSchematic('app', { name: 'ui' }, appTree);
            var angularJson = ast_utils_1.readJsonInTree(tree, 'angular.json');
            expect(angularJson.projects['ui']).toBeDefined();
            expect(angularJson.projects['ui']['architect']['build']['builder']).toEqual('@angular-devkit/build-angular:browser');
        });
    });
});
