"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var affected_apps_1 = require("./affected-apps");
var projects = [
    {
        name: 'app1Name',
        root: 'apps/app1',
        files: ['apps/app1/app1.ts'],
        tags: [],
        implicitDependencies: [],
        architect: {},
        type: affected_apps_1.ProjectType.app
    },
    {
        name: 'app2Name',
        root: 'apps/app2',
        files: ['apps/app2/app2.ts'],
        tags: [],
        implicitDependencies: [],
        architect: {},
        type: affected_apps_1.ProjectType.app
    },
    {
        name: 'lib1Name',
        root: 'libs/lib1',
        files: ['libs/lib1/lib1.ts'],
        tags: [],
        implicitDependencies: [],
        architect: {},
        type: affected_apps_1.ProjectType.lib
    },
    {
        name: 'lib2Name',
        root: 'libs/lib2',
        files: ['libs/lib2/lib2.ts'],
        tags: [],
        implicitDependencies: [],
        architect: {},
        type: affected_apps_1.ProjectType.lib
    }
];
describe('Calculates Dependencies Between Apps and Libs', function () {
    describe('dependencies', function () {
        it('should return a graph with a key for every project', function () {
            var deps = affected_apps_1.dependencies('nrwl', [
                {
                    name: 'app1Name',
                    root: 'apps/app1',
                    files: [],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                },
                {
                    name: 'app2Name',
                    root: 'apps/app2',
                    files: [],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                }
            ], function () { return null; });
            expect(deps).toEqual({ app1Name: [], app2Name: [] });
        });
        // NOTE: previously we did create an implicit dependency here, but that is now handled in `getProjectNodes`
        it('should not create implicit dependencies between e2e and apps', function () {
            var deps = affected_apps_1.dependencies('nrwl', [
                {
                    name: 'app1Name',
                    root: 'apps/app1',
                    files: [],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                },
                {
                    name: 'app1Name-e2e',
                    root: 'apps/app1Name-e2e',
                    files: [],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.e2e
                }
            ], function () { return null; });
            expect(deps).toEqual({
                app1Name: [],
                'app1Name-e2e': []
            });
        });
        it('should support providing implicit deps for e2e project with custom name', function () {
            var deps = affected_apps_1.dependencies('nrwl', [
                {
                    name: 'app1Name',
                    root: 'apps/app1',
                    files: [],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                },
                {
                    name: 'customName-e2e',
                    root: 'apps/customName-e2e',
                    files: [],
                    tags: [],
                    implicitDependencies: ['app1Name'],
                    architect: {},
                    type: affected_apps_1.ProjectType.e2e
                }
            ], function () { return null; });
            expect(deps).toEqual({
                app1Name: [],
                'customName-e2e': [
                    { projectName: 'app1Name', type: affected_apps_1.DependencyType.implicit }
                ]
            });
        });
        it('should support providing implicit deps for e2e project with standard name', function () {
            var deps = affected_apps_1.dependencies('nrwl', [
                {
                    name: 'app1Name',
                    root: 'apps/app1',
                    files: [],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                },
                {
                    name: 'app2Name',
                    root: 'apps/app2',
                    files: [],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                },
                {
                    name: 'app1Name-e2e',
                    root: 'apps/app1Name-e2e',
                    files: [],
                    tags: [],
                    implicitDependencies: ['app2Name'],
                    architect: {},
                    type: affected_apps_1.ProjectType.e2e
                }
            ], function () { return null; });
            expect(deps).toEqual({
                app1Name: [],
                app2Name: [],
                'app1Name-e2e': [
                    { projectName: 'app2Name', type: affected_apps_1.DependencyType.implicit }
                ]
            });
        });
        it('should infer deps between projects based on imports', function () {
            var deps = affected_apps_1.dependencies('nrwl', [
                {
                    name: 'app1Name',
                    root: 'apps/app1',
                    files: ['app1.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                },
                {
                    name: 'lib1Name',
                    root: 'libs/lib1',
                    files: ['lib1.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.lib
                },
                {
                    name: 'lib2Name',
                    root: 'libs/lib2',
                    files: ['lib2.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.lib
                }
            ], function (file) {
                switch (file) {
                    case 'app1.ts':
                        return "\n            import '@nrwl/lib1';\n            import '@nrwl/lib2/deep';\n          ";
                    case 'lib1.ts':
                        return "import '@nrwl/lib2'";
                    case 'lib2.ts':
                        return '';
                }
            });
            expect(deps).toEqual({
                app1Name: [
                    { projectName: 'lib1Name', type: affected_apps_1.DependencyType.es6Import },
                    { projectName: 'lib2Name', type: affected_apps_1.DependencyType.es6Import }
                ],
                lib1Name: [{ projectName: 'lib2Name', type: affected_apps_1.DependencyType.es6Import }],
                lib2Name: []
            });
        });
        it('should infer dependencies expressed via loadChildren', function () {
            var deps = affected_apps_1.dependencies('nrwl', [
                {
                    name: 'app1Name',
                    root: 'apps/app1',
                    files: ['app1.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                },
                {
                    name: 'lib1Name',
                    root: 'libs/lib1',
                    files: ['lib1.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.lib
                },
                {
                    name: 'lib2Name',
                    root: 'libs/lib2',
                    files: ['lib2.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.lib
                }
            ], function (file) {
                switch (file) {
                    case 'app1.ts':
                        return "\n            const routes = {\n              path: 'a', loadChildren: '@nrwl/lib1#LibModule',\n              path: 'b', loadChildren: '@nrwl/lib2/deep#LibModule'\n            };\n          ";
                    case 'lib1.ts':
                        return '';
                    case 'lib2.ts':
                        return '';
                }
            });
            expect(deps).toEqual({
                app1Name: [
                    { projectName: 'lib1Name', type: affected_apps_1.DependencyType.loadChildren },
                    { projectName: 'lib2Name', type: affected_apps_1.DependencyType.loadChildren }
                ],
                lib1Name: [],
                lib2Name: []
            });
        });
        it('should handle non-ts files', function () {
            var deps = affected_apps_1.dependencies('nrwl', [
                {
                    name: 'app1Name',
                    root: 'apps/app1',
                    files: ['index.html'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                }
            ], function () { return null; });
            expect(deps).toEqual({ app1Name: [] });
        });
        it('should handle projects with the names starting with the same string', function () {
            var deps = affected_apps_1.dependencies('nrwl', [
                {
                    name: 'aaName',
                    root: 'libs/aa',
                    files: ['aa.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                },
                {
                    name: 'aaBbName',
                    root: 'libs/aa/bb',
                    files: ['bb.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                }
            ], function (file) {
                switch (file) {
                    case 'aa.ts':
                        return "import '@nrwl/aa/bb'";
                    case 'bb.ts':
                        return '';
                }
            });
            expect(deps).toEqual({
                aaBbName: [],
                aaName: [{ projectName: 'aaBbName', type: affected_apps_1.DependencyType.es6Import }]
            });
        });
        it('should not add the same dependency twice', function () {
            var deps = affected_apps_1.dependencies('nrwl', [
                {
                    name: 'aaName',
                    root: 'libs/aa',
                    files: ['aa.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                },
                {
                    name: 'bbName',
                    root: 'libs/bb',
                    files: ['bb.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                }
            ], function (file) {
                switch (file) {
                    case 'aa.ts':
                        return "\n              import '@nrwl/bb/bb'\n              import '@nrwl/bb/bb'\n              ";
                    case 'bb.ts':
                        return '';
                }
            });
            expect(deps).toEqual({
                aaName: [{ projectName: 'bbName', type: affected_apps_1.DependencyType.es6Import }],
                bbName: []
            });
        });
        it('should not add a dependency on self', function () {
            var deps = affected_apps_1.dependencies('nrwl', [
                {
                    name: 'aaName',
                    root: 'libs/aa',
                    files: ['aa.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                }
            ], function (file) {
                switch (file) {
                    case 'aa.ts':
                        return "\n              import '@nrwl/aa/aa'\n              ";
                }
            });
            expect(deps).toEqual({ aaName: [] });
        });
    });
    describe('affectedAppNames', function () {
        it('should return the list of affected apps', function () {
            var affected = affected_apps_1.affectedAppNames('nrwl', projects, {
                files: {
                    'package.json': ['app1Name', 'app2Name', 'lib1Name', 'lib2Name']
                },
                projects: {}
            }, function (file) {
                switch (file) {
                    case 'apps/app1/app1.ts':
                        return "\n            import '@nrwl/lib1';\n          ";
                    case 'apps/app2/app2.ts':
                        return "";
                    case 'libs/lib1/lib1.ts':
                        return "import '@nrwl/lib2'";
                    case 'libs/lib2/lib2.ts':
                        return '';
                }
            }, ['libs/lib2/lib2.ts']);
            expect(affected).toEqual(['app1Name']);
        });
        it('should return all app names if a touched file is not part of a project', function () {
            var affected = affected_apps_1.affectedAppNames('nrwl', projects, {
                files: {
                    'package.json': ['app1Name', 'app2Name', 'lib1Name', 'lib2Name']
                },
                projects: {}
            }, function (file) {
                switch (file) {
                    case 'apps/app1/app1.ts':
                        return "\n            import '@nrwl/lib1';\n          ";
                    case 'apps/app2/app2.ts':
                        return "";
                    case 'libs/lib1/lib1.ts':
                        return "import '@nrwl/lib2'";
                    case 'libs/lib2/lib2.ts':
                        return "";
                }
            }, ['package.json']);
            expect(affected).toEqual(['app2Name', 'app1Name']);
        });
        it('should return list of affected apps if a touched file is part of a project-level implicit dependency', function () {
            var projects = [
                {
                    name: 'app1Name',
                    root: 'apps/app1',
                    files: ['apps/app1/app1.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                },
                {
                    name: 'app2Name',
                    root: 'apps/app2',
                    files: ['apps/app2/app2.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                },
                {
                    name: 'lib1Name',
                    root: 'libs/lib1',
                    files: ['libs/lib1/lib1.ts'],
                    tags: [],
                    implicitDependencies: ['lib2Name'],
                    architect: {},
                    type: affected_apps_1.ProjectType.lib
                },
                {
                    name: 'lib2Name',
                    root: 'libs/lib2',
                    files: ['libs/lib2/lib2.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.lib
                }
            ];
            var affected = affected_apps_1.affectedAppNames('nrwl', projects, {
                files: {
                    'package.json': ['app1Name', 'app2Name', 'lib1Name', 'lib2Name']
                },
                projects: {
                    lib2Name: ['lib1Name']
                }
            }, function (file) {
                switch (file) {
                    case 'apps/app1/app1.ts':
                        return "\n            import '@nrwl/lib1';\n          ";
                    case 'apps/app2/app2.ts':
                        return "";
                    case 'libs/lib1/lib1.ts':
                        return "";
                    case 'libs/lib2/lib2.ts':
                        return "";
                }
            }, ['libs/lib2/lib2.ts']);
            expect(affected).toEqual(['app1Name']);
        });
        it('should handle slashes', function () {
            var affected = affected_apps_1.affectedAppNames('nrwl', [
                {
                    name: 'app1Name',
                    root: 'apps/app1',
                    files: ['apps\\app1\\one\\app1.ts', 'apps\\app1\\two\\app1.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                }
            ], {
                files: {
                    'package.json': ['app1Name', 'app2Name', 'lib1Name', 'lib2Name']
                },
                projects: {}
            }, function (file) {
                switch (file) {
                    case 'apps/app1/one/app1.ts':
                        return '';
                    case 'apps/app1/two/app1.ts':
                        return '';
                }
            }, ['apps\\app1\\one\\app1.ts', 'apps\\app2\\two\\app1.ts']);
            expect(affected).toEqual(['app1Name']);
        });
        it('should handle circular dependencies', function () {
            var affected = affected_apps_1.affectedAppNames('nrwl', [
                {
                    name: 'app1Name',
                    root: 'apps/app1',
                    files: ['apps/app1/app1.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                },
                {
                    name: 'app2Name',
                    root: 'apps/app2',
                    files: ['apps/app2/app2.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                }
            ], {
                files: {
                    'package.json': ['app1Name', 'app2Name', 'lib1Name', 'lib2Name']
                },
                projects: {}
            }, function (file) {
                switch (file) {
                    case 'apps/app1/app1.ts':
                        return "import '@nrwl/app2';";
                    case 'apps/app2/app2.ts':
                        return "import '@nrwl/app1';";
                }
            }, ['apps/app1/app1.ts']);
            expect(affected).toEqual(['app2Name', 'app1Name']);
        });
        it('should handle circular dependencies for project-level implicit dependencies', function () {
            var affected = affected_apps_1.affectedAppNames('nrwl', [
                {
                    name: 'app1Name',
                    root: 'apps/app1',
                    files: ['apps/app1/app1.ts'],
                    tags: [],
                    implicitDependencies: ['app2Name'],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                },
                {
                    name: 'app2Name',
                    root: 'apps/app2',
                    files: ['apps/app2/app2.ts'],
                    tags: [],
                    implicitDependencies: ['app1Name'],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                }
            ], {
                files: {
                    'package.json': ['app1Name', 'app2Name', 'lib1Name', 'lib2Name']
                },
                projects: {
                    app1Name: ['app2Name'],
                    app2Name: ['app1Name']
                }
            }, function (file) {
                switch (file) {
                    case 'apps/app1/app1.ts':
                        return "";
                    case 'apps/app2/app2.ts':
                        return "";
                }
            }, ['apps/app1/app1.ts']);
            expect(affected).toEqual(['app2Name', 'app1Name']);
        });
    });
    describe('touchedProjects', function () {
        it('should return the list of touchedProjects', function () {
            var tp = affected_apps_1.touchedProjects({
                files: {
                    'package.json': ['app1Name', 'app2Name', 'lib1Name', 'lib2Name']
                },
                projects: {}
            }, [
                {
                    name: 'app1Name',
                    root: 'apps/app1',
                    files: ['app1.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                },
                {
                    name: 'app2Name',
                    root: 'apps/app2',
                    files: ['app2.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                },
                {
                    name: 'lib1Name',
                    root: 'libs/lib1',
                    files: ['lib1.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.lib
                },
                {
                    name: 'lib2Name',
                    root: 'libs/lib2',
                    files: ['lib2.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.lib
                }
            ], ['lib2.ts', 'app2.ts', 'package.json']);
            expect(tp).toEqual(['app1Name', 'app2Name', 'lib1Name', 'lib2Name']);
        });
        it('should return the list of touchedProjects independent from the git structure', function () {
            var tp = affected_apps_1.touchedProjects({
                files: {
                    'package.json': ['app1Name', 'app2Name', 'lib1Name', 'lib2Name']
                },
                projects: {}
            }, [
                {
                    name: 'app1Name',
                    root: 'apps/app1',
                    files: ['app1.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                },
                {
                    name: 'app2Name',
                    root: 'apps/app2',
                    files: ['app2.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                },
                {
                    name: 'lib1Name',
                    root: 'libs/lib1',
                    files: ['lib1.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.lib
                },
                {
                    name: 'lib2Name',
                    root: 'libs/lib2',
                    files: ['lib2.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.lib
                }
            ], ['gitrepo/some/path/inside/nx/libs/lib2/lib2.ts', 'apps/app2/app2.ts']);
            expect(tp).toEqual(['app2Name', 'lib2Name']);
        });
        it('should return the list of implicitly touched projects', function () {
            var tp = affected_apps_1.touchedProjects({
                files: {
                    'package.json': ['app1Name', 'app2Name', 'lib1Name', 'lib2Name'],
                    Jenkinsfile: ['app1Name', 'app2Name']
                },
                projects: {}
            }, [
                {
                    name: 'app1Name',
                    root: 'apps/app1',
                    files: ['app1.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                },
                {
                    name: 'app2Name',
                    root: 'apps/app2',
                    files: ['app2.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                },
                {
                    name: 'lib1Name',
                    root: 'libs/lib1',
                    files: ['lib1.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.lib
                },
                {
                    name: 'lib2Name',
                    root: 'libs/lib2',
                    files: ['lib2.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.lib
                }
            ], ['Jenkinsfile']);
            expect(tp).toEqual(['app1Name', 'app2Name']);
        });
        it('should return the list of implicitly touched projects independent from the git structure', function () {
            var tp = affected_apps_1.touchedProjects({
                files: {
                    'package.json': ['app1Name', 'app2Name', 'lib1Name', 'lib2Name'],
                    Jenkinsfile: ['app1Name', 'app2Name']
                },
                projects: {}
            }, [
                {
                    name: 'app1Name',
                    root: 'apps/app1',
                    files: ['app1.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                },
                {
                    name: 'app2Name',
                    root: 'apps/app2',
                    files: ['app2.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.app
                },
                {
                    name: 'lib1Name',
                    root: 'libs/lib1',
                    files: ['lib1.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.lib
                },
                {
                    name: 'lib2Name',
                    root: 'libs/lib2',
                    files: ['lib2.ts'],
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    type: affected_apps_1.ProjectType.lib
                }
            ], ['gitrepo/some/path/Jenkinsfile']);
            expect(tp).toEqual(['app1Name', 'app2Name']);
        });
    });
});
