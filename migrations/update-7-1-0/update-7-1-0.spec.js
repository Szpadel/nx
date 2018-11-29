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
describe('Update 7.1.0', function () {
    var initialTree;
    var schematicRunner;
    beforeEach(function () {
        initialTree = schematics_1.Tree.empty();
        initialTree.create('package.json', fileutils_1.serializeJson({
            scripts: {}
        }));
        schematicRunner = new testing_1.SchematicTestRunner('@nrwl/schematics', path.join(__dirname, '../migrations.json'));
    });
    it('should add generic affected script', function () { return __awaiter(_this, void 0, void 0, function () {
        var result, scripts;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, schematicRunner
                        .runSchematicAsync('update-7.1.0', {}, initialTree)
                        .toPromise()];
                case 1:
                    result = _a.sent();
                    scripts = JSON.parse(result.readContent('package.json')).scripts;
                    expect(scripts.affected).toEqual('./node_modules/.bin/nx affected');
                    return [2 /*return*/];
            }
        });
    }); });
    it('should update prettier', function () { return __awaiter(_this, void 0, void 0, function () {
        var result, devDependencies;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, schematicRunner
                        .runSchematicAsync('update-7.1.0', {}, initialTree)
                        .toPromise()];
                case 1:
                    result = _a.sent();
                    devDependencies = JSON.parse(result.readContent('package.json')).devDependencies;
                    expect(devDependencies.prettier).toEqual('1.15.2');
                    return [2 /*return*/];
            }
        });
    }); });
    describe('.prettierignore', function () {
        it('should not be touched if one exists', function () { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        initialTree.create('.prettierignore', '**/*.json');
                        return [4 /*yield*/, schematicRunner
                                .runSchematicAsync('update-7.1.0', {}, initialTree)
                                .toPromise()];
                    case 1:
                        result = _a.sent();
                        expect(result.readContent('.prettierignore')).toEqual('**/*.json');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should be created if one does not exist', function () { return __awaiter(_this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, schematicRunner
                            .runSchematicAsync('update-7.1.0', {}, initialTree)
                            .toPromise()];
                    case 1:
                        result = _a.sent();
                        expect(result.exists('.prettierignore')).toEqual(true);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
