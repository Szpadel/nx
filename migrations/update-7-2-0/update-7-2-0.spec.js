"use strict";
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
var schematics_1 = require("@angular-devkit/schematics");
var testing_1 = require("@angular-devkit/schematics/testing");
var fileutils_1 = require("../../src/utils/fileutils");
var path = require("path");
var ast_utils_1 = require("../../src/utils/ast-utils");
describe('Update 7.2.0', function () {
    var initialTree;
    var schematicRunner;
    beforeEach(function () {
        initialTree = schematics_1.Tree.empty();
        initialTree.create('package.json', fileutils_1.serializeJson({
            scripts: {}
        }));
        createJson('tsconfig.json', {});
        createJson('angular.json', {
            projects: {
                app1: {
                    root: 'apps/app1',
                    architect: {
                        build: {
                            builder: '@angular-devkit/build-angular:browser',
                            options: {
                                tsConfig: 'apps/app1/tsconfig.app.json'
                            }
                        },
                        test: {
                            builder: '@angular-devkit/build-angular:karma',
                            options: {
                                tsConfig: 'apps/app1/tsconfig.spec.json'
                            }
                        },
                        lint: {
                            builder: '@angular-devkit/build-angular:tslint',
                            options: {
                                tsConfig: [
                                    'apps/app1/tsconfig.app.json',
                                    'apps/app1/tsconfig.spec.json'
                                ]
                            }
                        }
                    }
                },
                'app1-e2e': {
                    root: 'apps/app1-e2e',
                    architect: {
                        e2e: {
                            builder: '@angular-devkit/build-angular:protractor',
                            options: {
                                tsConfig: 'apps/app1-e2e/tsconfig.e2e.json'
                            }
                        },
                        lint: {
                            builder: '@angular-devkit/build-angular:tslint',
                            options: {
                                tsConfig: 'apps/app1-e2e/tsconfig.e2e.json'
                            }
                        }
                    }
                },
                app2: {
                    root: 'apps/app2',
                    architect: {
                        build: {
                            builder: '@angular-devkit/build-angular:browser',
                            options: {
                                tsConfig: 'apps/app2/tsconfig.app.json'
                            }
                        },
                        test: {
                            builder: '@nrwl/schematics:jest',
                            options: {
                                tsConfig: 'apps/app2/tsconfig.spec.json'
                            }
                        },
                        lint: {
                            builder: '@angular-devkit/build-angular:tslint',
                            options: {
                                tsConfig: [
                                    'apps/app2/tsconfig.app.json',
                                    'apps/app2/tsconfig.spec.json'
                                ]
                            }
                        }
                    }
                },
                'app2-e2e': {
                    root: 'apps/app2-e2e',
                    architect: {
                        e2e: {
                            builder: '@nrwl/builders:cypress',
                            options: {
                                tsConfig: 'apps/app2-e2e/tsconfig.e2e.json'
                            }
                        }
                    }
                },
                'node-app': {
                    root: 'apps/node-app',
                    architect: {
                        build: {
                            builder: '@nrwl/builders:node-build',
                            options: {
                                tsConfig: 'apps/node-app/tsconfig.app.json'
                            }
                        },
                        test: {
                            builder: '@nrwl/schematics:jest',
                            options: {
                                tsConfig: 'apps/node-app/tsconfig.spec.json'
                            }
                        },
                        lint: {
                            builder: '@angular-devkit/build-angular:tslint',
                            options: {
                                tsConfig: [
                                    'apps/node-app/tsconfig.app.json',
                                    'apps/node-app/tsconfig.spec.json'
                                ]
                            }
                        }
                    }
                },
                'weird-app': {
                    root: 'apps/weird/app',
                    architect: {
                        build: {
                            builder: '@nrwl/builders:node-build',
                            options: {
                                tsConfig: 'apps/weird/app/src/tsconfig.app.json'
                            }
                        },
                        test: {
                            builder: '@nrwl/schematics:jest',
                            options: {
                                tsConfig: 'apps/weird/app/src/tsconfig.spec.json'
                            }
                        },
                        lint: {
                            builder: '@angular-devkit/build-angular:tslint',
                            options: {
                                tsConfig: [
                                    'apps/weird/app/src/tsconfig.app.json',
                                    'apps/weird/app/src/tsconfig.spec.json'
                                ]
                            }
                        }
                    }
                },
                lib1: {
                    root: 'libs/lib1',
                    architect: {
                        test: {
                            builder: '@angular-devkit/build-angular:karma',
                            options: {
                                tsConfig: 'libs/lib1/tsconfig.spec.json'
                            }
                        },
                        lint: {
                            builder: '@angular-devkit/build-angular:tslint',
                            options: {
                                tsConfig: [
                                    'libs/lib1/tsconfig.lib.json',
                                    'libs/lib1/tsconfig.spec.json'
                                ]
                            }
                        }
                    }
                },
                lib2: {
                    root: 'libs/lib2',
                    architect: {
                        test: {
                            builder: '@angular-devkit/build-angular:jest',
                            options: {
                                tsConfig: 'libs/lib2/tsconfig.spec.json'
                            }
                        },
                        lint: {
                            builder: '@angular-devkit/build-angular:tslint',
                            options: {
                                tsConfig: [
                                    'libs/lib2/tsconfig.lib.json',
                                    'libs/lib2/tsconfig.spec.json'
                                ]
                            }
                        }
                    }
                }
            }
        });
        createJson('apps/app1/tsconfig.app.json', {
            extends: '../../tsconfig.json',
            compilerOptions: {
                types: ['jquery']
            }
        });
        createJson('apps/app1/tsconfig.spec.json', {
            extends: '../../tsconfig.json',
            compilerOptions: {
                types: ['jasmine', 'node', 'sinon']
            }
        });
        createJson('apps/app1-e2e/tsconfig.e2e.json', {
            extends: '../../tsconfig.json',
            compilerOptions: {
                types: ['jasmine', 'jasminewd2', 'node']
            }
        });
        createJson('apps/app2/tsconfig.app.json', {
            extends: '../../tsconfig.json',
            compilerOptions: {
                types: []
            }
        });
        createJson('apps/app2/tsconfig.spec.json', {
            extends: '../../tsconfig.json',
            compilerOptions: {
                types: ['jest', 'node']
            }
        });
        createJson('apps/app2-e2e/tsconfig.e2e.json', {
            extends: '../../tsconfig.json',
            compilerOptions: {
                types: ['cypress', 'node']
            }
        });
        createJson('apps/node-app/tsconfig.app.json', {
            extends: '../../tsconfig.json',
            compilerOptions: {
                types: ['node']
            }
        });
        createJson('apps/node-app/tsconfig.spec.json', {
            extends: '../../tsconfig.json',
            compilerOptions: {
                types: ['jest', 'node']
            }
        });
        createJson('apps/weird/app/src/tsconfig.app.json', {
            extends: '../../../tsconfig.json',
            compilerOptions: {}
        });
        createJson('apps/weird/app/src/tsconfig.spec.json', {
            extends: '../../../tsconfig.json',
            compilerOptions: {}
        });
        createJson('libs/lib1/tsconfig.lib.json', {
            extends: '../../tsconfig.json',
            compilerOptions: {
                types: []
            }
        });
        createJson('libs/lib1/tsconfig.spec.json', {
            extends: '../../tsconfig.json',
            compilerOptions: {
                types: ['jasmine', 'node']
            }
        });
        createJson('libs/lib2/tsconfig.lib.json', {
            extends: '../../tsconfig.json',
            compilerOptions: {
                types: []
            }
        });
        createJson('libs/lib2/tsconfig.spec.json', {
            extends: '../../tsconfig.json',
            compilerOptions: {
                types: ['jest', 'node']
            }
        });
        function createJson(path, value) {
            initialTree.create(path, fileutils_1.serializeJson(value));
        }
        schematicRunner = new testing_1.SchematicTestRunner('@nrwl/schematics', path.join(__dirname, '../migrations.json'));
    });
    it('should create tsconfigs for existing projects', function () { return __awaiter(_this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, schematicRunner
                        .runSchematicAsync('update-7.2.0', {}, initialTree)
                        .toPromise()];
                case 1:
                    result = _a.sent();
                    expect(result.files).toContain('/tsconfig.json');
                    expect(result.files).toContain('/apps/app1/tsconfig.json');
                    expect(result.files).toContain('/apps/app1-e2e/tsconfig.json');
                    expect(result.files).toContain('/apps/app2/tsconfig.json');
                    expect(result.files).toContain('/apps/app2-e2e/tsconfig.json');
                    expect(result.files).toContain('/apps/node-app/tsconfig.json');
                    expect(result.files).toContain('/apps/weird/app/tsconfig.json');
                    expect(result.files).toContain('/libs/lib1/tsconfig.json');
                    expect(result.files).toContain('/libs/lib2/tsconfig.json');
                    [
                        '/apps/app1/tsconfig.json',
                        '/apps/app1-e2e/tsconfig.json',
                        '/apps/app2/tsconfig.json',
                        '/apps/app2-e2e/tsconfig.json',
                        '/apps/node-app/tsconfig.json',
                        '/libs/lib1/tsconfig.json',
                        '/libs/lib2/tsconfig.json'
                    ].forEach(function (tsConfig) {
                        var value = ast_utils_1.readJsonInTree(result, tsConfig);
                        expect(value.extends).toEqual('../../tsconfig.json');
                    });
                    expect(ast_utils_1.readJsonInTree(result, 'apps/weird/app/tsconfig.json').extends).toEqual('../../../tsconfig.json');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should edit existing tsconfigs to extend the new one', function () { return __awaiter(_this, void 0, void 0, function () {
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, schematicRunner
                        .runSchematicAsync('update-7.2.0', {}, initialTree)
                        .toPromise()];
                case 1:
                    result = _a.sent();
                    [
                        '/apps/app1/tsconfig.app.json',
                        '/apps/app1/tsconfig.spec.json',
                        '/apps/app1-e2e/tsconfig.e2e.json',
                        '/apps/app2/tsconfig.app.json',
                        '/apps/app2/tsconfig.spec.json',
                        '/apps/app2-e2e/tsconfig.e2e.json',
                        '/apps/node-app/tsconfig.app.json',
                        '/apps/node-app/tsconfig.spec.json',
                        '/libs/lib1/tsconfig.lib.json',
                        '/libs/lib1/tsconfig.spec.json',
                        '/libs/lib2/tsconfig.lib.json',
                        '/libs/lib2/tsconfig.spec.json'
                    ].forEach(function (tsConfig) {
                        var value = ast_utils_1.readJsonInTree(result, tsConfig);
                        expect(value.extends).toEqual('./tsconfig.json');
                    });
                    expect(ast_utils_1.readJsonInTree(result, 'apps/weird/app/src/tsconfig.app.json').extends).toEqual('../tsconfig.json');
                    expect(ast_utils_1.readJsonInTree(result, 'apps/weird/app/src/tsconfig.spec.json').extends).toEqual('../tsconfig.json');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should edit existing tsconfigs to have a union of all types being used', function () { return __awaiter(_this, void 0, void 0, function () {
        function getTypes(path) {
            return ast_utils_1.readJsonInTree(result, path).compilerOptions.types;
        }
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, schematicRunner
                        .runSchematicAsync('update-7.2.0', {}, initialTree)
                        .toPromise()];
                case 1:
                    result = _a.sent();
                    expect(getTypes('apps/app1/tsconfig.json')).toEqual([
                        'jquery',
                        'jasmine',
                        'node',
                        'sinon'
                    ]);
                    expect(getTypes('apps/app1-e2e/tsconfig.json')).toEqual([
                        'jasmine',
                        'jasminewd2',
                        'node'
                    ]);
                    expect(getTypes('apps/app2/tsconfig.json')).toEqual(['jest', 'node']);
                    expect(getTypes('apps/app2-e2e/tsconfig.json')).toEqual([
                        'cypress',
                        'node'
                    ]);
                    expect(getTypes('apps/node-app/tsconfig.json')).toEqual(['node', 'jest']);
                    expect(getTypes('apps/weird/app/tsconfig.json')).toBeUndefined();
                    expect(getTypes('libs/lib1/tsconfig.json')).toEqual(['jasmine', 'node']);
                    expect(getTypes('libs/lib2/tsconfig.json')).toEqual(['jest', 'node']);
                    return [2 /*return*/];
            }
        });
    }); });
    it("should not set types if one of the project's tsconfigs do not have types defined", function () { return __awaiter(_this, void 0, void 0, function () {
        function getTypes(path) {
            return ast_utils_1.readJsonInTree(result, path).compilerOptions.types;
        }
        var result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, schematicRunner
                        .callRule(ast_utils_1.updateJsonInTree('apps/app1/tsconfig.app.json', function (json) {
                        delete json.compilerOptions.types;
                        return json;
                    }), initialTree)
                        .toPromise()];
                case 1:
                    initialTree = _a.sent();
                    return [4 /*yield*/, schematicRunner
                            .runSchematicAsync('update-7.2.0', {}, initialTree)
                            .toPromise()];
                case 2:
                    result = _a.sent();
                    expect(getTypes('apps/app1/tsconfig.json')).toBeUndefined();
                    return [2 /*return*/];
            }
        });
    }); });
});
