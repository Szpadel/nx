"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular-devkit/schematics/testing");
var schematics_1 = require("@angular-devkit/schematics");
var path = require("path");
var testing_utils_1 = require("../testing-utils");
var format_files_1 = require("./format-files");
var fileutils_1 = require("../fileutils");
describe('formatFiles', function () {
    var tree;
    var schematicRunner;
    beforeEach(function () {
        schematicRunner = new testing_1.SchematicTestRunner('@nrwl/schematics', path.join(__dirname, '../../collection.json'));
        tree = testing_utils_1.createEmptyWorkspace(schematics_1.Tree.empty());
        tree.overwrite('package.json', fileutils_1.serializeJson({
            scripts: {
                format: 'prettier'
            }
        }));
    });
    it('should format files', function (done) {
        schematicRunner.callRule(format_files_1.formatFiles(), tree).subscribe(function (result) {
            expect(schematicRunner.tasks.length).toBe(1);
            expect(schematicRunner.tasks[0]).toEqual({
                name: 'node-package',
                options: {
                    packageName: 'run format -- --untracked',
                    quiet: true
                }
            });
            done();
        });
    });
    it('should not format files if there is no format npm script', function (done) {
        tree.overwrite('package.json', fileutils_1.serializeJson({
            scripts: {}
        }));
        schematicRunner.callRule(format_files_1.formatFiles(), tree).subscribe(function (result) {
            expect(schematicRunner.tasks.length).toBe(0);
            //TODO: test that a warning is emitted.
            done();
        });
    });
    it('should not format files if skipFormat is passed', function (done) {
        schematicRunner
            .callRule(format_files_1.formatFiles({ skipFormat: true }), tree)
            .subscribe(function (result) {
            expect(schematicRunner.tasks.length).toBe(0);
            //TODO: test that a warning is not emitted.
            done();
        });
    });
});
