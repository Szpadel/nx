"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var nxEnforceModuleBoundariesRule_1 = require("./nxEnforceModuleBoundariesRule");
var affected_apps_1 = require("../command-line/affected-apps");
describe('Enforce Module Boundaries', function () {
    it('should not error when everything is in order', function () {
        var failures = runRule({ allow: ['@mycompany/mylib/deep'] }, process.cwd() + "/proj/apps/myapp/src/main.ts", "\n        import '@mycompany/mylib';\n        import '@mycompany/mylib/deep';\n        import '../blah';\n      ", [
            {
                name: 'myappName',
                root: 'libs/myapp',
                type: affected_apps_1.ProjectType.app,
                tags: [],
                implicitDependencies: [],
                architect: {},
                files: ["apps/myapp/src/main.ts", "apps/myapp/blah.ts"]
            },
            {
                name: 'mylibName',
                root: 'libs/mylib',
                type: affected_apps_1.ProjectType.lib,
                tags: [],
                implicitDependencies: [],
                architect: {},
                files: ["libs/mylib/src/index.ts", "libs/mylib/src/deep.ts"]
            }
        ]);
        expect(failures.length).toEqual(0);
    });
    it('should handle multiple projects starting with the same prefix properly', function () {
        var failures = runRule({}, process.cwd() + "/proj/apps/myapp/src/main.ts", "\n        import '@mycompany/myapp2/mylib';\n      ", [
            {
                name: 'myappName',
                root: 'libs/myapp',
                type: affected_apps_1.ProjectType.app,
                tags: [],
                implicitDependencies: [],
                architect: {},
                files: ["apps/myapp/src/main.ts", "apps/myapp/src/blah.ts"]
            },
            {
                name: 'myapp2Name',
                root: 'libs/myapp2',
                type: affected_apps_1.ProjectType.app,
                tags: [],
                implicitDependencies: [],
                architect: {},
                files: []
            },
            {
                name: 'myapp2-mylib',
                root: 'libs/myapp2/mylib',
                type: affected_apps_1.ProjectType.lib,
                tags: [],
                implicitDependencies: [],
                architect: {},
                files: ['libs/myapp2/mylib/src/index.ts']
            }
        ]);
        expect(failures.length).toEqual(0);
    });
    describe('depConstraints', function () {
        var projectNodes = [
            {
                name: 'apiName',
                root: 'libs/api',
                type: affected_apps_1.ProjectType.lib,
                tags: ['api', 'domain1'],
                implicitDependencies: [],
                architect: {},
                files: ["libs/api/src/index.ts"]
            },
            {
                name: 'implName',
                root: 'libs/impl',
                type: affected_apps_1.ProjectType.lib,
                tags: ['impl', 'domain1'],
                implicitDependencies: [],
                architect: {},
                files: ["libs/impl/src/index.ts"]
            },
            {
                name: 'impl2Name',
                root: 'libs/impl2',
                type: affected_apps_1.ProjectType.lib,
                tags: ['impl', 'domain1'],
                implicitDependencies: [],
                architect: {},
                files: ["libs/impl2/src/index.ts"]
            },
            {
                name: 'impl-domain2Name',
                root: 'libs/impl-domain2',
                type: affected_apps_1.ProjectType.lib,
                tags: ['impl', 'domain2'],
                implicitDependencies: [],
                architect: {},
                files: ["libs/impl-domain2/src/index.ts"]
            },
            {
                name: 'impl-both-domainsName',
                root: 'libs/impl-both-domains',
                type: affected_apps_1.ProjectType.lib,
                tags: ['impl', 'domain1', 'domain2'],
                implicitDependencies: [],
                architect: {},
                files: ["libs/impl-both-domains/src/index.ts"]
            },
            {
                name: 'untaggedName',
                root: 'libs/untagged',
                type: affected_apps_1.ProjectType.lib,
                tags: [],
                implicitDependencies: [],
                architect: {},
                files: ["libs/untagged/src/index.ts"]
            }
        ];
        var depConstraints = {
            depConstraints: [
                { sourceTag: 'api', onlyDependOnLibsWithTags: ['api'] },
                { sourceTag: 'impl', onlyDependOnLibsWithTags: ['api', 'impl'] },
                { sourceTag: 'domain1', onlyDependOnLibsWithTags: ['domain1'] },
                { sourceTag: 'domain2', onlyDependOnLibsWithTags: ['domain2'] }
            ]
        };
        it('should error when the target library does not have the right tag', function () {
            var failures = runRule(depConstraints, process.cwd() + "/proj/libs/api/src/index.ts", "\n        import '@mycompany/impl';\n      ", projectNodes);
            expect(failures[0].getFailure()).toEqual('A project tagged with "api" can only depend on libs tagged with "api"');
        });
        it('should error when the target library is untagged', function () {
            var failures = runRule(depConstraints, process.cwd() + "/proj/libs/api/src/index.ts", "\n        import '@mycompany/untagged';\n      ", projectNodes);
            expect(failures[0].getFailure()).toEqual('A project tagged with "api" can only depend on libs tagged with "api"');
        });
        it('should error when the source library is untagged', function () {
            var failures = runRule(depConstraints, process.cwd() + "/proj/libs/untagged/src/index.ts", "\n        import '@mycompany/api';\n      ", projectNodes);
            expect(failures[0].getFailure()).toEqual('A project without tags cannot depend on any libraries');
        });
        it('should check all tags', function () {
            var failures = runRule(depConstraints, process.cwd() + "/proj/libs/impl/src/index.ts", "\n        import '@mycompany/impl-domain2';\n      ", projectNodes);
            expect(failures[0].getFailure()).toEqual('A project tagged with "domain1" can only depend on libs tagged with "domain1"');
        });
        it('should allow a domain1 project to depend on a project that is tagged with domain1 and domain2', function () {
            var failures = runRule(depConstraints, process.cwd() + "/proj/libs/impl/src/index.ts", "\n        import '@mycompany/impl-both-domains';\n      ", projectNodes);
            expect(failures.length).toEqual(0);
        });
        it('should allow a domain1/domain2 project depend on domain1', function () {
            var failures = runRule(depConstraints, process.cwd() + "/proj/libs/impl-both-domain/src/index.ts", "\n        import '@mycompany/impl';\n      ", projectNodes);
            expect(failures.length).toEqual(0);
        });
        it('should not error when the constraints are satisfied', function () {
            var failures = runRule(depConstraints, process.cwd() + "/proj/libs/impl/src/index.ts", "\n        import '@mycompany/impl2';\n      ", projectNodes);
            expect(failures.length).toEqual(0);
        });
        it('should support wild cards', function () {
            var failures = runRule({
                depConstraints: [{ sourceTag: '*', onlyDependOnLibsWithTags: ['*'] }]
            }, process.cwd() + "/proj/libs/api/src/index.ts", "\n        import '@mycompany/impl';\n      ", projectNodes);
            expect(failures.length).toEqual(0);
        });
    });
    describe('relative imports', function () {
        it('should not error when relatively importing the same library', function () {
            var failures = runRule({}, process.cwd() + "/proj/libs/mylib/src/main.ts", 'import "../other"', [
                {
                    name: 'mylibName',
                    root: 'libs/mylib',
                    type: affected_apps_1.ProjectType.lib,
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    files: ["libs/mylib/src/main.ts", "libs/mylib/other.ts"]
                }
            ]);
            expect(failures.length).toEqual(0);
        });
        it('should not error when relatively importing the same library (index file)', function () {
            var failures = runRule({}, process.cwd() + "/proj/libs/mylib/src/main.ts", 'import "../other"', [
                {
                    name: 'mylibName',
                    root: 'libs/mylib',
                    type: affected_apps_1.ProjectType.lib,
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    files: ["libs/mylib/src/main.ts", "libs/mylib/other/index.ts"]
                }
            ]);
            expect(failures.length).toEqual(0);
        });
        it('should error when relatively importing another library', function () {
            var failures = runRule({}, process.cwd() + "/proj/libs/mylib/src/main.ts", 'import "../../other"', [
                {
                    name: 'mylibName',
                    root: 'libs/mylib',
                    type: affected_apps_1.ProjectType.lib,
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    files: ["libs/mylib/src/main.ts"]
                },
                {
                    name: 'otherName',
                    root: 'libs/other',
                    type: affected_apps_1.ProjectType.lib,
                    tags: [],
                    implicitDependencies: [],
                    architect: {},
                    files: ['libs/other/src/index.ts']
                }
            ]);
            expect(failures[0].getFailure()).toEqual('library imports must start with @mycompany/');
        });
    });
    it('should error on absolute imports into libraries without using the npm scope', function () {
        var failures = runRule({}, process.cwd() + "/proj/libs/mylib/src/main.ts", 'import "libs/src/other.ts"', [
            {
                name: 'mylibName',
                root: 'libs/mylib',
                type: affected_apps_1.ProjectType.lib,
                tags: [],
                implicitDependencies: [],
                architect: {},
                files: ["libs/mylib/src/main.ts", "libs/mylib/src/other.ts"]
            }
        ]);
        expect(failures.length).toEqual(1);
        expect(failures[0].getFailure()).toEqual('library imports must start with @mycompany/');
    });
    it('should error about deep imports into libraries', function () {
        var failures = runRule({}, process.cwd() + "/proj/libs/mylib/src/main.ts", "\n      import \"@mycompany/other/src/blah\"\n      import \"@mycompany/other/src/sublib/blah\"\n      ", [
            {
                name: 'mylibName',
                root: 'libs/mylib',
                type: affected_apps_1.ProjectType.lib,
                tags: [],
                implicitDependencies: [],
                architect: {},
                files: ["libs/mylib/src/main.ts", "libs/mylib/src/another-file.ts"]
            },
            {
                name: 'otherName',
                root: 'libs/other',
                type: affected_apps_1.ProjectType.lib,
                tags: [],
                implicitDependencies: [],
                architect: {},
                files: ["libs/other/src/blah.ts"]
            },
            {
                name: 'otherSublibName',
                root: 'libs/other/sublib',
                type: affected_apps_1.ProjectType.lib,
                tags: [],
                implicitDependencies: [],
                architect: {},
                files: ["libs/other/sublib/src/blah.ts"]
            }
        ]);
        expect(failures[0].getFailure()).toEqual('deep imports into libraries are forbidden');
        expect(failures[1].getFailure()).toEqual('deep imports into libraries are forbidden');
    });
    it('should error on importing a lazy-loaded library', function () {
        var failures = runRule({}, process.cwd() + "/proj/libs/mylib/src/main.ts", 'import "@mycompany/other";', [
            {
                name: 'mylibName',
                root: 'libs/mylib',
                type: affected_apps_1.ProjectType.lib,
                tags: [],
                implicitDependencies: [],
                architect: {},
                files: ["libs/mylib/src/main.ts"]
            },
            {
                name: 'otherName',
                root: 'libs/other',
                type: affected_apps_1.ProjectType.lib,
                tags: [],
                implicitDependencies: [],
                architect: {},
                files: ["libs/other/index.ts"]
            }
        ], {
            mylibName: [
                { projectName: 'otherName', type: affected_apps_1.DependencyType.loadChildren }
            ]
        });
        expect(failures[0].getFailure()).toEqual('imports of lazy-loaded libraries are forbidden');
    });
    it('should error on importing an app', function () {
        var failures = runRule({}, process.cwd() + "/proj/libs/mylib/src/main.ts", 'import "@mycompany/myapp"', [
            {
                name: 'mylibName',
                root: 'libs/mylib',
                type: affected_apps_1.ProjectType.lib,
                tags: [],
                implicitDependencies: [],
                architect: {},
                files: ["libs/mylib/src/main.ts"]
            },
            {
                name: 'myappName',
                root: 'apps/myapp',
                type: affected_apps_1.ProjectType.app,
                tags: [],
                implicitDependencies: [],
                architect: {},
                files: ["apps/myapp/src/index.ts"]
            }
        ]);
        expect(failures[0].getFailure()).toEqual('imports of apps are forbidden');
    });
    it('should error when circular dependency detected', function () {
        var failures = runRule({}, process.cwd() + "/proj/libs/anotherlib/src/main.ts", 'import "@mycompany/mylib"', [
            {
                name: 'mylibName',
                root: 'libs/mylib',
                type: affected_apps_1.ProjectType.lib,
                tags: [],
                implicitDependencies: [],
                architect: {},
                files: ["libs/mylib/src/main.ts"]
            },
            {
                name: 'anotherlibName',
                root: 'libs/anotherlib',
                type: affected_apps_1.ProjectType.lib,
                tags: [],
                implicitDependencies: [],
                architect: {},
                files: ["libs/anotherlib/src/main.ts"]
            },
            {
                name: 'myappName',
                root: 'apps/myapp',
                type: affected_apps_1.ProjectType.app,
                tags: [],
                implicitDependencies: [],
                architect: {},
                files: ["apps/myapp/src/index.ts"]
            }
        ], {
            mylibName: [
                { projectName: 'anotherlibName', type: affected_apps_1.DependencyType.es6Import }
            ]
        });
        expect(failures[0].getFailure()).toEqual('Circular dependency between "anotherlibName" and "mylibName" detected');
    });
    it('should error when circular dependency detected (indirect)', function () {
        var failures = runRule({}, process.cwd() + "/proj/libs/mylib/src/main.ts", 'import "@mycompany/badcirclelib"', [
            {
                name: 'mylibName',
                root: 'libs/mylib',
                type: affected_apps_1.ProjectType.lib,
                tags: [],
                implicitDependencies: [],
                architect: {},
                files: ["libs/mylib/src/main.ts"]
            },
            {
                name: 'anotherlibName',
                root: 'libs/anotherlib',
                type: affected_apps_1.ProjectType.lib,
                tags: [],
                implicitDependencies: [],
                architect: {},
                files: ["libs/anotherlib/src/main.ts"]
            },
            {
                name: 'badcirclelibName',
                root: 'libs/badcirclelib',
                type: affected_apps_1.ProjectType.lib,
                tags: [],
                implicitDependencies: [],
                architect: {},
                files: ["libs/badcirclelib/src/main.ts"]
            },
            {
                name: 'myappName',
                root: 'apps/myapp',
                type: affected_apps_1.ProjectType.app,
                tags: [],
                implicitDependencies: [],
                architect: {},
                files: ["apps/myapp/index.ts"]
            }
        ], {
            mylibName: [
                { projectName: 'badcirclelibName', type: affected_apps_1.DependencyType.es6Import }
            ],
            badcirclelibName: [
                { projectName: 'anotherlibName', type: affected_apps_1.DependencyType.es6Import }
            ],
            anotherlibName: [
                { projectName: 'mylibName', type: affected_apps_1.DependencyType.es6Import }
            ]
        });
        expect(failures[0].getFailure()).toEqual('Circular dependency between "mylibName" and "badcirclelibName" detected');
    });
});
function runRule(ruleArguments, contentPath, content, projectNodes, deps) {
    if (deps === void 0) { deps = {}; }
    var options = {
        ruleArguments: [ruleArguments],
        ruleSeverity: 'error',
        ruleName: 'enforceModuleBoundaries'
    };
    var sourceFile = ts.createSourceFile(contentPath, content, ts.ScriptTarget.Latest, true);
    var rule = new nxEnforceModuleBoundariesRule_1.Rule(options, process.cwd() + "/proj", 'mycompany', projectNodes, deps);
    return rule.apply(sourceFile);
}
