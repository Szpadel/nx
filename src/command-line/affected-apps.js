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
var ts = require("typescript");
var path = require("path");
var shared_1 = require("./shared");
var ProjectType;
(function (ProjectType) {
    ProjectType["app"] = "app";
    ProjectType["e2e"] = "e2e";
    ProjectType["lib"] = "lib";
})(ProjectType = exports.ProjectType || (exports.ProjectType = {}));
var DependencyType;
(function (DependencyType) {
    DependencyType["es6Import"] = "es6Import";
    DependencyType["loadChildren"] = "loadChildren";
    DependencyType["implicit"] = "implicit";
})(DependencyType = exports.DependencyType || (exports.DependencyType = {}));
function implicitlyTouchedProjects(implicitDependencies, touchedFiles) {
    return Array.from(Object.entries(implicitDependencies.files).reduce(function (projectSet, _a) {
        var file = _a[0], projectNames = _a[1];
        if (touchedFiles.find(function (tf) { return tf.endsWith(file); })) {
            projectNames.forEach(function (projectName) {
                projectSet.add(projectName);
            });
        }
        return projectSet;
    }, new Set()));
}
function directlyTouchedProjects(projects, touchedFiles) {
    return projects
        .filter(function (project) {
        return touchedFiles.some(function (file) {
            return project.files.some(function (projectFile) {
                return file.endsWith(projectFile);
            });
        });
    })
        .map(function (project) { return project.name; });
}
function touchedProjects(implicitDependencies, projects, touchedFiles) {
    projects = normalizeProjects(projects);
    touchedFiles = normalizeFiles(touchedFiles);
    var itp = implicitlyTouchedProjects(implicitDependencies, touchedFiles);
    // Return if all projects were implicitly touched
    if (itp.length === projects.length) {
        return itp;
    }
    var dtp = directlyTouchedProjects(projects, touchedFiles);
    return projects
        .filter(function (project) { return itp.includes(project.name) || dtp.includes(project.name); })
        .map(function (project) { return project.name; });
}
exports.touchedProjects = touchedProjects;
function affectedProjects(npmScope, projects, implicitDependencies, fileRead, touchedFiles) {
    projects = normalizeProjects(projects);
    var deps = dependencies(npmScope, projects, fileRead);
    var tp = touchedProjects(implicitDependencies, projects, touchedFiles);
    return projects.filter(function (proj) {
        return hasDependencyOnTouchedProjects(proj.name, tp, deps, []);
    });
}
function affectedAppNames(npmScope, projects, implicitDependencies, fileRead, touchedFiles) {
    return affectedProjects(npmScope, projects, implicitDependencies, fileRead, touchedFiles)
        .filter(function (p) { return p.type === ProjectType.app; })
        .map(function (p) { return p.name; });
}
exports.affectedAppNames = affectedAppNames;
function affectedLibNames(npmScope, projects, implicitDependencies, fileRead, touchedFiles) {
    return affectedProjects(npmScope, projects, implicitDependencies, fileRead, touchedFiles)
        .filter(function (p) { return p.type === ProjectType.lib; })
        .map(function (p) { return p.name; });
}
exports.affectedLibNames = affectedLibNames;
function affectedProjectNames(npmScope, projects, implicitDependencies, fileRead, touchedFiles) {
    return affectedProjects(npmScope, projects, implicitDependencies, fileRead, touchedFiles).map(function (p) { return p.name; });
}
exports.affectedProjectNames = affectedProjectNames;
function affectedProjectNamesWithTarget(target) {
    return function (npmScope, projects, implicitDependencies, fileRead, touchedFiles) {
        return affectedProjects(npmScope, projects, implicitDependencies, fileRead, touchedFiles)
            .filter(function (p) { return p.architect[target]; })
            .map(function (p) { return p.name; });
    };
}
exports.affectedProjectNamesWithTarget = affectedProjectNamesWithTarget;
function hasDependencyOnTouchedProjects(project, touchedProjects, deps, visisted) {
    if (touchedProjects.indexOf(project) > -1)
        return true;
    if (visisted.indexOf(project) > -1)
        return false;
    return (deps[project]
        .map(function (d) { return d.projectName; })
        .filter(function (k) {
        return hasDependencyOnTouchedProjects(k, touchedProjects, deps, visisted.concat([project]));
    }).length > 0);
}
function normalizeProjects(projects) {
    return projects.map(function (p) {
        return __assign({}, p, { files: normalizeFiles(p.files) });
    });
}
function normalizeFiles(files) {
    return files.map(function (f) { return f.replace(/[\\\/]+/g, '/'); });
}
function dependencies(npmScope, projects, fileRead) {
    return new DepsCalculator(npmScope, projects, fileRead).calculateDeps();
}
exports.dependencies = dependencies;
var DepsCalculator = /** @class */ (function () {
    function DepsCalculator(npmScope, projects, fileRead) {
        this.npmScope = npmScope;
        this.projects = projects;
        this.fileRead = fileRead;
        this.projects.sort(function (a, b) {
            if (!a.root)
                return -1;
            if (!b.root)
                return -1;
            return a.root.length > b.root.length ? -1 : 1;
        });
    }
    DepsCalculator.prototype.calculateDeps = function () {
        this.deps = this.projects.reduce(function (m, c) {
            var _a;
            return (__assign({}, m, (_a = {}, _a[c.name] = [], _a)));
        }, {});
        this.setImplicitDepsFromProjects(this.deps, this.projects);
        this.processAllFiles();
        return this.deps;
        // return this.includeTransitive();
    };
    DepsCalculator.prototype.setImplicitDepsFromProjects = function (deps, projects) {
        var _this = this;
        projects.forEach(function (project) {
            if (project.implicitDependencies.length === 0) {
                return;
            }
            project.implicitDependencies.forEach(function (depName) {
                _this.setDependencyIfNotAlreadySet(deps, project.name, depName, DependencyType.implicit);
            });
        });
    };
    DepsCalculator.prototype.processAllFiles = function () {
        var _this = this;
        this.projects.forEach(function (p) {
            p.files.forEach(function (f) {
                _this.processFile(p.name, f);
            });
        });
    };
    DepsCalculator.prototype.processFile = function (projectName, filePath) {
        if (path.extname(filePath) === '.ts') {
            var tsFile = ts.createSourceFile(filePath, this.fileRead(filePath), ts.ScriptTarget.Latest, true);
            this.processNode(projectName, tsFile);
        }
    };
    DepsCalculator.prototype.processNode = function (projectName, node) {
        var _this = this;
        if (node.kind === ts.SyntaxKind.ImportDeclaration) {
            var imp = this.getStringLiteralValue(node.moduleSpecifier);
            this.addDepIfNeeded(imp, projectName, DependencyType.es6Import);
            return; // stop traversing downwards
        }
        if (node.kind === ts.SyntaxKind.PropertyAssignment) {
            var name = this.getPropertyAssignmentName(node.name);
            if (name === 'loadChildren') {
                var init = node.initializer;
                if (init.kind === ts.SyntaxKind.StringLiteral) {
                    var childrenExpr = this.getStringLiteralValue(init);
                    this.addDepIfNeeded(childrenExpr, projectName, DependencyType.loadChildren);
                    return; // stop traversing downwards
                }
            }
        }
        /**
         * Continue traversing down the AST from the current node
         */
        ts.forEachChild(node, function (child) { return _this.processNode(projectName, child); });
    };
    DepsCalculator.prototype.getPropertyAssignmentName = function (nameNode) {
        switch (nameNode.kind) {
            case ts.SyntaxKind.Identifier:
                return nameNode.getText();
            case ts.SyntaxKind.StringLiteral:
                return nameNode.text;
            default:
                return null;
        }
    };
    DepsCalculator.prototype.addDepIfNeeded = function (expr, projectName, depType) {
        var _this = this;
        var matchingProject = this.projects.filter(function (a) {
            var normalizedRoot = shared_1.normalizedProjectRoot(a);
            return (expr === "@" + _this.npmScope + "/" + normalizedRoot ||
                expr.startsWith("@" + _this.npmScope + "/" + normalizedRoot + "#") ||
                expr.startsWith("@" + _this.npmScope + "/" + normalizedRoot + "/"));
        })[0];
        if (matchingProject) {
            this.setDependencyIfNotAlreadySet(this.deps, projectName, matchingProject.name, depType);
        }
    };
    DepsCalculator.prototype.setDependencyIfNotAlreadySet = function (deps, depSource, depTarget, depType) {
        var alreadyHasDep = deps[depSource].some(function (p) { return p.projectName === depTarget && p.type === depType; });
        var depOnSelf = depSource === depTarget;
        if (!alreadyHasDep && !depOnSelf) {
            var dep = { projectName: depTarget, type: depType };
            deps[depSource].push(dep);
        }
    };
    DepsCalculator.prototype.getStringLiteralValue = function (node) {
        return node.getText().substr(1, node.getText().length - 2);
    };
    return DepsCalculator;
}());
