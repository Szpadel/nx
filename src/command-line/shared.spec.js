"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var shared_1 = require("./shared");
var affected_apps_1 = require("./affected-apps");
describe('assertWorkspaceValidity', function () {
    var mockNxJson;
    var mockAngularJson;
    beforeEach(function () {
        mockNxJson = {
            projects: {
                app1: {
                    tags: []
                },
                'app1-e2e': {
                    tags: []
                },
                app2: {
                    tags: []
                },
                'app2-e2e': {
                    tags: []
                },
                lib1: {
                    tags: []
                },
                lib2: {
                    tags: []
                }
            }
        };
        mockAngularJson = {
            projects: {
                app1: {},
                'app1-e2e': {},
                app2: {},
                'app2-e2e': {},
                lib1: {},
                lib2: {}
            }
        };
    });
    it('should not throw for a valid workspace', function () {
        shared_1.assertWorkspaceValidity(mockAngularJson, mockNxJson);
    });
    it('should throw for a missing project in angular.json', function () {
        delete mockAngularJson.projects.app1;
        try {
            shared_1.assertWorkspaceValidity(mockAngularJson, mockNxJson);
            fail('Did not throw');
        }
        catch (e) {
            expect(e.message).toContain('projects are missing in angular.json');
        }
    });
    it('should throw for a missing project in nx.json', function () {
        delete mockNxJson.projects.app1;
        try {
            shared_1.assertWorkspaceValidity(mockAngularJson, mockNxJson);
            fail('Did not throw');
        }
        catch (e) {
            expect(e.message).toContain('projects are missing in nx.json');
        }
    });
    it('should throw for an invalid top-level implicit dependency', function () {
        mockNxJson.implicitDependencies = {
            'README.md': ['invalidproj']
        };
        try {
            shared_1.assertWorkspaceValidity(mockAngularJson, mockNxJson);
            fail('Did not throw');
        }
        catch (e) {
            expect(e.message).toContain('implicitDependencies specified in nx.json are invalid');
            expect(e.message).toContain('  README.md');
            expect(e.message).toContain('    invalidproj');
        }
    });
    it('should throw for an invalid project-level implicit dependency', function () {
        mockNxJson.projects.app2.implicitDependencies = ['invalidproj'];
        try {
            shared_1.assertWorkspaceValidity(mockAngularJson, mockNxJson);
            fail('Did not throw');
        }
        catch (e) {
            expect(e.message).toContain('implicitDependencies specified in nx.json are invalid');
            expect(e.message).toContain('  app2');
            expect(e.message).toContain('    invalidproj');
        }
    });
});
describe('getImplicitDependencies', function () {
    var mockNxJson;
    var mockAngularJson;
    beforeEach(function () {
        mockNxJson = {
            projects: {
                app1: {
                    tags: []
                },
                'app1-e2e': {
                    tags: []
                },
                app2: {
                    tags: []
                },
                'app2-e2e': {
                    tags: []
                },
                lib1: {
                    tags: []
                },
                lib2: {
                    tags: []
                }
            }
        };
        mockAngularJson = {
            projects: {
                app1: {
                    projectType: 'application'
                },
                'app1-e2e': {
                    projectType: 'application'
                },
                app2: {
                    projectType: 'application'
                },
                'app2-e2e': {
                    projectType: 'application'
                },
                lib1: {
                    projectType: 'library'
                },
                lib2: {
                    projectType: 'library'
                }
            }
        };
    });
    describe('top-level implicit dependencies', function () {
        it('should return implicit dependencies', function () {
            mockNxJson.implicitDependencies = {
                Jenkinsfile: ['app1', 'app2']
            };
            var result = shared_1.getImplicitDependencies(mockAngularJson, mockNxJson);
            expect(result).toEqual({
                files: {
                    Jenkinsfile: ['app1', 'app2']
                },
                projects: {
                    app1: ['app1-e2e'],
                    app2: ['app2-e2e']
                }
            });
        });
        it('should normalize wildcards into all projects', function () {
            mockNxJson.implicitDependencies = {
                'package.json': '*'
            };
            var result = shared_1.getImplicitDependencies(mockAngularJson, mockNxJson);
            expect(result).toEqual({
                files: {
                    'package.json': [
                        'app1',
                        'app1-e2e',
                        'app2',
                        'app2-e2e',
                        'lib1',
                        'lib2'
                    ]
                },
                projects: {
                    app1: ['app1-e2e'],
                    app2: ['app2-e2e']
                }
            });
        });
        it('should call throw for an invalid workspace', function () {
            delete mockNxJson.projects.app1;
            try {
                shared_1.getImplicitDependencies(mockAngularJson, mockNxJson);
                fail('did not throw');
            }
            catch (e) { }
        });
    });
    describe('project-based implicit dependencies', function () {
        it('should default appropriately', function () {
            var result = shared_1.getImplicitDependencies(mockAngularJson, mockNxJson);
            expect(result).toEqual({
                files: {},
                projects: {
                    app1: ['app1-e2e'],
                    app2: ['app2-e2e']
                }
            });
        });
        it('should allow setting on libs and apps', function () {
            mockNxJson.projects.app2.implicitDependencies = ['app1'];
            mockNxJson.projects.lib2.implicitDependencies = ['lib1'];
            var result = shared_1.getImplicitDependencies(mockAngularJson, mockNxJson);
            expect(result).toEqual({
                files: {},
                projects: {
                    app1: ['app1-e2e', 'app2'],
                    app2: ['app2-e2e'],
                    lib1: ['lib2']
                }
            });
        });
        // NOTE: originally e2e apps had a magic dependency on their target app by naming convention.
        // So, 'appName-e2e' depended on 'appName'.
        it('should override magic e2e dependencies if specified', function () {
            mockNxJson.projects['app1-e2e'].implicitDependencies = ['app2'];
            var result = shared_1.getImplicitDependencies(mockAngularJson, mockNxJson);
            expect(result).toEqual({
                files: {},
                projects: {
                    app2: ['app1-e2e', 'app2-e2e']
                }
            });
        });
        it('should fallback to magic e2e dependencies if empty array specified', function () {
            mockNxJson.projects['app1-e2e'].implicitDependencies = [];
            var result = shared_1.getImplicitDependencies(mockAngularJson, mockNxJson);
            expect(result).toEqual({
                files: {},
                projects: {
                    app1: ['app1-e2e'],
                    app2: ['app2-e2e']
                }
            });
        });
    });
    describe('project-based and top-level implicit dependencies', function () {
        it('allows setting both', function () {
            mockNxJson.implicitDependencies = {
                Jenkinsfile: ['app1', 'app2']
            };
            mockNxJson.projects.app2.implicitDependencies = ['app1'];
            var result = shared_1.getImplicitDependencies(mockAngularJson, mockNxJson);
            expect(result).toEqual({
                files: {
                    Jenkinsfile: ['app1', 'app2']
                },
                projects: {
                    app1: ['app1-e2e', 'app2'],
                    app2: ['app2-e2e']
                }
            });
        });
    });
});
describe('getProjectNodes', function () {
    var mockNxJson;
    var mockAngularJson;
    beforeEach(function () {
        mockNxJson = {
            projects: {
                app1: {
                    tags: []
                },
                'app1-e2e': {
                    tags: []
                },
                'customName-e2e': {
                    tags: []
                },
                lib1: {
                    tags: []
                },
                lib2: {
                    tags: []
                }
            }
        };
        mockAngularJson = {
            projects: {
                app1: {
                    projectType: 'application'
                },
                'app1-e2e': {
                    projectType: 'application'
                },
                'customName-e2e': {
                    projectType: 'application'
                },
                lib1: {
                    projectType: 'library'
                },
                lib2: {
                    projectType: 'library'
                }
            }
        };
    });
    it('should parse nodes as correct type', function () {
        var result = shared_1.getProjectNodes(mockAngularJson, mockNxJson).map(function (node) {
            return { name: node.name, type: node.type };
        });
        expect(result).toEqual([
            {
                name: 'app1',
                type: affected_apps_1.ProjectType.app
            },
            {
                name: 'app1-e2e',
                type: affected_apps_1.ProjectType.e2e
            },
            {
                name: 'customName-e2e',
                type: affected_apps_1.ProjectType.e2e
            },
            {
                name: 'lib1',
                type: affected_apps_1.ProjectType.lib
            },
            {
                name: 'lib2',
                type: affected_apps_1.ProjectType.lib
            }
        ]);
    });
    it('should normalize missing architect configurations to an empty object', function () {
        var result = shared_1.getProjectNodes(mockAngularJson, mockNxJson).map(function (node) {
            return { name: node.name, architect: node.architect };
        });
        expect(result).toEqual([
            {
                name: 'app1',
                architect: {}
            },
            {
                name: 'app1-e2e',
                architect: {}
            },
            {
                name: 'customName-e2e',
                architect: {}
            },
            {
                name: 'lib1',
                architect: {}
            },
            {
                name: 'lib2',
                architect: {}
            }
        ]);
    });
});
