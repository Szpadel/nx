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
Object.defineProperty(exports, "__esModule", { value: true });
var affected_apps_1 = require("./affected-apps");
var dep_graph_1 = require("./dep-graph");
describe('dep-graph', function () {
    describe('getNodeProps', function () {
        var _a, _b, _c, _d, _e, _f, _g;
        var deps = {
            app1: [],
            app2: [
                {
                    projectName: 'lib1',
                    type: affected_apps_1.DependencyType.es6Import
                }
            ],
            lib1: [],
            lib2: [
                {
                    projectName: 'lib1',
                    type: affected_apps_1.DependencyType.es6Import
                }
            ],
            lib3: []
        };
        var projects = [
            {
                name: 'app1',
                root: 'apps/app1',
                type: affected_apps_1.ProjectType.app,
                tags: [],
                implicitDependencies: [],
                architect: {},
                files: []
            },
            {
                name: 'app2',
                root: 'apps/app2',
                type: affected_apps_1.ProjectType.app,
                tags: [],
                implicitDependencies: [],
                architect: {},
                files: []
            },
            {
                name: 'lib1',
                root: 'libs/lib1',
                type: affected_apps_1.ProjectType.lib,
                tags: [],
                implicitDependencies: [],
                architect: {},
                files: []
            },
            {
                name: 'lib2',
                root: 'libs/lib2',
                type: affected_apps_1.ProjectType.lib,
                tags: [],
                implicitDependencies: [],
                architect: {},
                files: []
            },
            {
                name: 'lib3',
                root: 'libs/lib3',
                type: affected_apps_1.ProjectType.lib,
                tags: [],
                implicitDependencies: [],
                architect: {},
                files: []
            }
        ];
        var graphvizOptions = {
            graph: [],
            nodes: (_a = {},
                _a[affected_apps_1.ProjectType.app] = (_b = {},
                    _b[dep_graph_1.NodeEdgeVariant.default] = {},
                    _b[dep_graph_1.NodeEdgeVariant.highlighted] = {},
                    _b),
                _a[affected_apps_1.ProjectType.lib] = (_c = {},
                    _c[dep_graph_1.NodeEdgeVariant.default] = {},
                    _c[dep_graph_1.NodeEdgeVariant.highlighted] = {
                        color: 'red'
                    },
                    _c),
                _a),
            edges: (_d = {},
                _d[affected_apps_1.DependencyType.es6Import] = (_e = {},
                    _e[dep_graph_1.NodeEdgeVariant.default] = {},
                    _e[dep_graph_1.NodeEdgeVariant.highlighted] = {},
                    _e),
                _d[affected_apps_1.DependencyType.loadChildren] = (_f = {},
                    _f[dep_graph_1.NodeEdgeVariant.default] = {},
                    _f[dep_graph_1.NodeEdgeVariant.highlighted] = {},
                    _f),
                _d[affected_apps_1.DependencyType.implicit] = (_g = {},
                    _g[dep_graph_1.NodeEdgeVariant.default] = {},
                    _g[dep_graph_1.NodeEdgeVariant.highlighted] = {},
                    _g),
                _d)
        };
        it('should generate the default dot output', function () {
            var resp = dep_graph_1.createGraphviz(graphvizOptions, deps, projects, {});
            expect(resp).toContain('"app1";');
            expect(resp).toContain('"app2";');
            expect(resp).toContain('"lib1";');
            expect(resp).toContain('"lib2";');
            expect(resp).toContain('"lib3";');
            expect(resp).toContain('"app2" -> "lib1";');
            expect(resp).toContain('"lib2" -> "lib1";');
        });
        it('should add style for highlighted nodes', function () {
            var _a, _b;
            var modifiedOptions = __assign({}, graphvizOptions, {
                nodes: __assign({}, graphvizOptions.nodes, (_a = {},
                    _a[affected_apps_1.ProjectType.lib] = (_b = {},
                        _b[dep_graph_1.NodeEdgeVariant.default] = {},
                        _b[dep_graph_1.NodeEdgeVariant.highlighted] = {
                            color: 'red'
                        },
                        _b),
                    _a))
            });
            var resp = dep_graph_1.createGraphviz(modifiedOptions, deps, projects, {
                lib1: true
            });
            expect(resp).toContain('"lib1" [ color = "red" ];');
        });
        it('should add style for highlighted edges', function () {
            var _a, _b, _c, _d;
            var modifiedOptions = __assign({}, graphvizOptions, {
                nodes: __assign({}, graphvizOptions.nodes, (_a = {},
                    _a[affected_apps_1.ProjectType.lib] = (_b = {},
                        _b[dep_graph_1.NodeEdgeVariant.default] = {},
                        _b[dep_graph_1.NodeEdgeVariant.highlighted] = {},
                        _b),
                    _a)),
                edges: __assign({}, graphvizOptions.edges, (_c = {}, _c[affected_apps_1.DependencyType.es6Import] = (_d = {},
                    _d[dep_graph_1.NodeEdgeVariant.default] = {},
                    _d[dep_graph_1.NodeEdgeVariant.highlighted] = {
                        color: 'blue'
                    },
                    _d), _c))
            });
            var resp = dep_graph_1.createGraphviz(modifiedOptions, deps, projects, {
                lib1: true
            });
            expect(resp).toContain('"lib1";');
            expect(resp).not.toContain('"lib1" [ color = "red" ];');
            expect(resp).toContain('"app2" -> "lib1" [ color = "blue" ];');
            expect(resp).toContain('"lib2" -> "lib1" [ color = "blue" ];');
        });
        it('should style all variants correctly', function () {
            var _a, _b, _c, _d, _e, _f, _g;
            var newDeps = {
                app1: [
                    {
                        projectName: 'lib1',
                        type: affected_apps_1.DependencyType.es6Import
                    }
                ],
                app2: [
                    {
                        projectName: 'lib1',
                        type: affected_apps_1.DependencyType.loadChildren
                    }
                ],
                lib1: [],
                lib2: [
                    {
                        projectName: 'lib1',
                        type: affected_apps_1.DependencyType.implicit
                    }
                ],
                lib3: []
            };
            var modifiedOptions = __assign({}, graphvizOptions, {
                nodes: (_a = {},
                    _a[affected_apps_1.ProjectType.app] = (_b = {},
                        _b[dep_graph_1.NodeEdgeVariant.default] = {
                            color: 'app-def'
                        },
                        _b[dep_graph_1.NodeEdgeVariant.highlighted] = {
                            color: 'app-highlight'
                        },
                        _b),
                    _a[affected_apps_1.ProjectType.lib] = (_c = {},
                        _c[dep_graph_1.NodeEdgeVariant.default] = {
                            color: 'lib-def'
                        },
                        _c[dep_graph_1.NodeEdgeVariant.highlighted] = {
                            color: 'lib-highlight'
                        },
                        _c),
                    _a),
                edges: (_d = {},
                    _d[affected_apps_1.DependencyType.es6Import] = (_e = {},
                        _e[dep_graph_1.NodeEdgeVariant.default] = {
                            color: 'es6Import-def'
                        },
                        _e[dep_graph_1.NodeEdgeVariant.highlighted] = {
                            color: 'es6Import-highlight'
                        },
                        _e),
                    _d[affected_apps_1.DependencyType.loadChildren] = (_f = {},
                        _f[dep_graph_1.NodeEdgeVariant.default] = {
                            color: 'loadChildren-def'
                        },
                        _f[dep_graph_1.NodeEdgeVariant.highlighted] = {
                            color: 'loadChildren-highlight'
                        },
                        _f),
                    _d[affected_apps_1.DependencyType.implicit] = (_g = {},
                        _g[dep_graph_1.NodeEdgeVariant.default] = {
                            color: 'implicit-def'
                        },
                        _g[dep_graph_1.NodeEdgeVariant.highlighted] = {
                            color: 'implicit-highlight'
                        },
                        _g),
                    _d)
            });
            var resp = dep_graph_1.createGraphviz(modifiedOptions, newDeps, projects, {
                app1: true,
                app2: true,
                lib1: true
            });
            expect(resp).toContain('"app1" [ color = "app-highlight" ];');
            expect(resp).toContain('"app2" [ color = "app-highlight" ];');
            expect(resp).toContain('"lib1" [ color = "lib-highlight" ];');
            expect(resp).toContain('"lib2" [ color = "lib-def" ];');
            expect(resp).toContain('"lib3" [ color = "lib-def" ];');
            expect(resp).toContain('"app1" -> "lib1" [ color = "es6Import-highlight" ];');
            expect(resp).toContain('"app2" -> "lib1" [ color = "loadChildren-highlight" ];');
            expect(resp).toContain('"lib2" -> "lib1" [ color = "implicit-highlight" ];');
            var respNoCriticalPath = dep_graph_1.createGraphviz(modifiedOptions, newDeps, projects, {});
            expect(respNoCriticalPath).toContain('"app1" -> "lib1" [ color = "es6Import-def" ];');
            expect(respNoCriticalPath).toContain('"app2" -> "lib1" [ color = "loadChildren-def" ];');
            expect(respNoCriticalPath).toContain('"lib2" -> "lib1" [ color = "implicit-def" ];');
        });
    });
});
