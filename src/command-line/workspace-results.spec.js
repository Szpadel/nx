"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var workspace_results_1 = require("./workspace-results");
var fileutils_1 = require("../utils/fileutils");
var literals_1 = require("@angular-devkit/core/src/utils/literals");
describe('WorkspacesResults', function () {
    var results;
    beforeEach(function () {
        results = new workspace_results_1.WorkspaceResults('test');
    });
    it('should be instantiable', function () {
        expect(results).toBeTruthy();
    });
    it('should default with no failed projects', function () {
        expect(results.hasFailure).toBe(false);
    });
    describe('success', function () {
        it('should return true when getting results', function () {
            results.success('proj');
            expect(results.getResult('proj')).toBe(true);
        });
        it('should remove results from file system', function () {
            spyOn(fs, 'writeSync');
            spyOn(fs, 'unlinkSync');
            spyOn(fs, 'existsSync').and.returnValue(true);
            results.success('proj');
            results.saveResults();
            expect(fs.writeSync).not.toHaveBeenCalled();
            expect(fs.unlinkSync).toHaveBeenCalledWith('dist/.nx-results');
        });
        it('should print results', function () {
            results.success('proj');
            spyOn(console, 'log');
            results.printResults(false, 'Success', 'Fail');
            expect(console.log).toHaveBeenCalledWith('Success');
        });
        it('should tell warn the user that not all tests were run', function () {
            results.startedWithFailedProjects = true;
            results.success('proj');
            spyOn(console, 'warn');
            results.printResults(true, 'Success', 'Fail');
            expect(console.warn).toHaveBeenCalledWith(literals_1.stripIndents(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n          Warning: Only failed affected projects were run.\n          You should run above command WITHOUT --only-failed\n        "], ["\n          Warning: Only failed affected projects were run.\n          You should run above command WITHOUT --only-failed\n        "]))));
        });
    });
    describe('fail', function () {
        it('should return false when getting results', function () {
            results.fail('proj');
            expect(results.getResult('proj')).toBe(false);
        });
        it('should save results to file system', function () {
            spyOn(fs, 'writeFileSync');
            results.fail('proj');
            results.saveResults();
            expect(fs.writeFileSync).toHaveBeenCalledWith('dist/.nx-results', fileutils_1.serializeJson({
                command: 'test',
                results: {
                    proj: false
                }
            }));
        });
        it('should print results', function () {
            results.fail('proj');
            spyOn(console, 'error');
            results.printResults(true, 'Success', 'Fail');
            expect(console.error).toHaveBeenCalledWith('Fail');
        });
        it('should tell warn the user that not all tests were run', function () {
            results.fail('proj');
            spyOn(console, 'log');
            results.printResults(false, 'Success', 'Fail');
            expect(console.log).toHaveBeenCalledWith("You can isolate the above projects by passing --only-failed");
        });
    });
    describe('when results already exist', function () {
        beforeEach(function () {
            spyOn(fs, 'existsSync').and.returnValue(true);
        });
        it('should read existing results', function () {
            spyOn(fs, 'readFileSync').and.returnValue(fileutils_1.serializeJson({
                command: 'test',
                results: {
                    proj: false
                }
            }));
            results = new workspace_results_1.WorkspaceResults('test');
            expect(fs.readFileSync).toHaveBeenCalledWith('dist/.nx-results', 'utf-8');
            expect(results.getResult('proj')).toBe(false);
        });
        it('should not read the existing results when the previous command was different', function () {
            spyOn(fs, 'readFileSync').and.returnValue(fileutils_1.serializeJson({
                command: 'test',
                results: {
                    proj: false
                }
            }));
            results = new workspace_results_1.WorkspaceResults('build');
            expect(results.getResult('proj')).toBeUndefined();
        });
    });
});
var templateObject_1;
