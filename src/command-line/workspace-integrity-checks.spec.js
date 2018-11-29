"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var workspace_integrity_checks_1 = require("./workspace-integrity-checks");
var affected_apps_1 = require("./affected-apps");
describe('WorkspaceIntegrityChecks', function () {
    var packageJson = {
        dependencies: {
            '@nrwl/nx': '1.2.3'
        },
        devDependencies: {
            '@nrwl/schematics': '1.2.3'
        }
    };
    describe('.angular-cli.json is in sync with the filesystem', function () {
        it('should not error when they are in sync', function () {
            var c = new workspace_integrity_checks_1.WorkspaceIntegrityChecks([
                {
                    name: 'project1',
                    type: affected_apps_1.ProjectType.lib,
                    root: 'libs/project1',
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    files: ['libs/project1/src/index.ts']
                }
            ], ['libs/project1/src/index.ts'], packageJson);
            expect(c.run().length).toEqual(0);
        });
        it('should error when there are projects without files', function () {
            var c = new workspace_integrity_checks_1.WorkspaceIntegrityChecks([
                {
                    name: 'project1',
                    type: affected_apps_1.ProjectType.lib,
                    root: 'libs/project1',
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    files: []
                },
                {
                    name: 'project2',
                    type: affected_apps_1.ProjectType.lib,
                    root: 'libs/project2',
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    files: ['libs/project2/src/index.ts']
                }
            ], ['libs/project2/src/index.ts'], packageJson);
            var errors = c.run();
            expect(errors.length).toEqual(1);
            expect(errors[0].errors[0]).toEqual("Cannot find project 'project1' in 'libs/project1'");
        });
        it('should error when there are files in apps or libs without projects', function () {
            var c = new workspace_integrity_checks_1.WorkspaceIntegrityChecks([
                {
                    name: 'project1',
                    type: affected_apps_1.ProjectType.lib,
                    root: 'libs/project1',
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    files: ['libs/project1/src/index.ts']
                }
            ], ['libs/project1/src/index.ts', 'libs/project2/src/index.ts'], packageJson);
            var errors = c.run();
            expect(errors.length).toEqual(1);
            expect(errors[0].errors[0]).toEqual("The 'libs/project2/src/index.ts' file doesn't belong to any project.");
        });
    });
    describe('package.json is consistent', function () {
        it('should not error when @nrwl/nx and @nrwl/schematics are in sync', function () {
            var c = new workspace_integrity_checks_1.WorkspaceIntegrityChecks([], [], packageJson);
            expect(c.run().length).toEqual(0);
        });
        it('should error when @nrwl/nx and @nrwl/schematics are not in sync', function () {
            var c = new workspace_integrity_checks_1.WorkspaceIntegrityChecks([], [], {
                dependencies: {
                    '@nrwl/nx': '1.2.3'
                },
                devDependencies: {
                    '@nrwl/schematics': '4.5.6'
                }
            });
            var errors = c.run();
            expect(errors.length).toEqual(1);
            expect(errors[0].errors[0]).toEqual("The versions of the @nrwl/nx and @nrwl/schematics packages must be the same.");
        });
    });
});
