"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var path = require("path");
var Lint = require("tslint");
var appRoot = require("app-root-path");
var shared_1 = require("../command-line/shared");
var affected_apps_1 = require("../command-line/affected-apps");
var Rule = /** @class */ (function (_super) {
    __extends(Rule, _super);
    function Rule(options, projectPath, npmScope, projectNodes, deps) {
        var _this = _super.call(this, options) || this;
        _this.projectPath = projectPath;
        _this.npmScope = npmScope;
        _this.projectNodes = projectNodes;
        _this.deps = deps;
        if (!projectPath) {
            _this.projectPath = appRoot.path;
            if (!global.projectNodes) {
                var angularJson = shared_1.readAngularJson();
                var nxJson = shared_1.readNxJson();
                global.npmScope = nxJson.npmScope;
                global.projectNodes = shared_1.getProjectNodes(angularJson, nxJson);
                global.deps = shared_1.readDependencies(global.npmScope, global.projectNodes);
            }
            _this.npmScope = global.npmScope;
            _this.projectNodes = global.projectNodes;
            _this.deps = global.deps;
        }
        return _this;
    }
    Rule.prototype.apply = function (sourceFile) {
        return this.applyWithWalker(new EnforceModuleBoundariesWalker(sourceFile, this.getOptions(), this.projectPath, this.npmScope, this.projectNodes, this.deps));
    };
    return Rule;
}(Lint.Rules.AbstractRule));
exports.Rule = Rule;
var EnforceModuleBoundariesWalker = /** @class */ (function (_super) {
    __extends(EnforceModuleBoundariesWalker, _super);
    function EnforceModuleBoundariesWalker(sourceFile, options, projectPath, npmScope, projectNodes, deps) {
        var _this = _super.call(this, sourceFile, options) || this;
        _this.projectPath = projectPath;
        _this.npmScope = npmScope;
        _this.projectNodes = projectNodes;
        _this.deps = deps;
        _this.projectNodes.sort(function (a, b) {
            if (!a.root)
                return -1;
            if (!b.root)
                return -1;
            return a.root.length > b.root.length ? -1 : 1;
        });
        _this.allow = Array.isArray(_this.getOptions()[0].allow)
            ? _this.getOptions()[0].allow.map(function (a) { return "" + a; })
            : [];
        _this.depConstraints = Array.isArray(_this.getOptions()[0].depConstraints)
            ? _this.getOptions()[0].depConstraints
            : [];
        return _this;
    }
    EnforceModuleBoundariesWalker.prototype.visitImportDeclaration = function (node) {
        var imp = node.moduleSpecifier
            .getText()
            .substring(1, node.moduleSpecifier.getText().length - 1);
        // whitelisted import
        if (this.allow.indexOf(imp) > -1) {
            _super.prototype.visitImportDeclaration.call(this, node);
            return;
        }
        // check for relative and absolute imports
        if (this.isRelativeImportIntoAnotherProject(imp) ||
            this.isAbsoluteImportIntoAnotherProject(imp)) {
            this.addFailureAt(node.getStart(), node.getWidth(), "library imports must start with @" + this.npmScope + "/");
            return;
        }
        // check constraints between libs and apps
        if (imp.startsWith("@" + this.npmScope + "/")) {
            // we should find the name
            var sourceProject = this.findSourceProject();
            var targetProject = this.findProjectUsingImport(imp); // findProjectUsingImport to take care of same prefix
            // something went wrong => return.
            if (!sourceProject || !targetProject) {
                _super.prototype.visitImportDeclaration.call(this, node);
                return;
            }
            // check for circular dependency
            if (this.isCircular(sourceProject, targetProject)) {
                var error = "Circular dependency between \"" + sourceProject.name + "\" and \"" + targetProject.name + "\" detected";
                this.addFailureAt(node.getStart(), node.getWidth(), error);
                return;
            }
            // same project => allow
            if (sourceProject === targetProject) {
                _super.prototype.visitImportDeclaration.call(this, node);
                return;
            }
            // cannot import apps
            if (targetProject.type !== affected_apps_1.ProjectType.lib) {
                this.addFailureAt(node.getStart(), node.getWidth(), 'imports of apps are forbidden');
                return;
            }
            // deep imports aren't allowed
            if (imp !== "@" + this.npmScope + "/" + shared_1.normalizedProjectRoot(targetProject)) {
                this.addFailureAt(node.getStart(), node.getWidth(), 'deep imports into libraries are forbidden');
                return;
            }
            // if we import a library using loadChildre, we should not import it using es6imports
            if (this.onlyLoadChildren(sourceProject.name, targetProject.name, [])) {
                this.addFailureAt(node.getStart(), node.getWidth(), 'imports of lazy-loaded libraries are forbidden');
                return;
            }
            // check that dependency constraints are satisfied
            if (this.depConstraints.length > 0) {
                var constraints = this.findConstraintsFor(sourceProject);
                // when no constrains found => error. Force the user to provision them.
                if (constraints.length === 0) {
                    this.addFailureAt(node.getStart(), node.getWidth(), "A project without tags cannot depend on any libraries");
                    return;
                }
                for (var _i = 0, constraints_1 = constraints; _i < constraints_1.length; _i++) {
                    var constraint = constraints_1[_i];
                    if (hasNoneOfTheseTags(targetProject, constraint.onlyDependOnLibsWithTags || [])) {
                        var allowedTags = constraint.onlyDependOnLibsWithTags
                            .map(function (s) { return "\"" + s + "\""; })
                            .join(', ');
                        var error = "A project tagged with \"" + constraint.sourceTag + "\" can only depend on libs tagged with " + allowedTags;
                        this.addFailureAt(node.getStart(), node.getWidth(), error);
                        return;
                    }
                }
            }
        }
        _super.prototype.visitImportDeclaration.call(this, node);
    };
    EnforceModuleBoundariesWalker.prototype.isCircular = function (sourceProject, targetProject) {
        if (!this.deps[targetProject.name])
            return false;
        return this.isDependingOn(targetProject.name, sourceProject.name);
    };
    EnforceModuleBoundariesWalker.prototype.isDependingOn = function (sourceProjectName, targetProjectName, done) {
        var _this = this;
        if (done === void 0) { done = {}; }
        if (done[sourceProjectName])
            return false;
        if (!this.deps[sourceProjectName])
            return false;
        return this.deps[sourceProjectName]
            .map(function (dep) {
            var _a;
            return dep.projectName === targetProjectName
                ? true
                : _this.isDependingOn(dep.projectName, targetProjectName, __assign({}, done, (_a = {}, _a["" + sourceProjectName] = true, _a)));
        })
            .some(function (result) { return result; });
    };
    EnforceModuleBoundariesWalker.prototype.onlyLoadChildren = function (sourceProjectName, targetProjectName, visited) {
        var _this = this;
        if (visited.indexOf(sourceProjectName) > -1)
            return false;
        return ((this.deps[sourceProjectName] || []).filter(function (d) {
            if (d.type !== affected_apps_1.DependencyType.loadChildren)
                return false;
            if (d.projectName === targetProjectName)
                return true;
            return _this.onlyLoadChildren(d.projectName, targetProjectName, visited.concat([
                sourceProjectName
            ]));
        }).length > 0);
    };
    EnforceModuleBoundariesWalker.prototype.isRelativeImportIntoAnotherProject = function (imp) {
        if (!this.isRelative(imp))
            return false;
        var targetFile = path
            .resolve(path.join(this.projectPath, path.dirname(this.getSourceFilePath())), imp)
            .split(path.sep)
            .join('/')
            .substring(this.projectPath.length + 1);
        var sourceProject = this.findSourceProject();
        var targetProject = this.findTargetProject(targetFile);
        return sourceProject && targetProject && sourceProject !== targetProject;
    };
    EnforceModuleBoundariesWalker.prototype.getSourceFilePath = function () {
        return this.getSourceFile().fileName.substring(this.projectPath.length + 1);
    };
    EnforceModuleBoundariesWalker.prototype.findSourceProject = function () {
        var targetFile = removeExt(this.getSourceFilePath());
        return this.findProjectUsingFile(targetFile);
    };
    EnforceModuleBoundariesWalker.prototype.findTargetProject = function (targetFile) {
        var targetProject = this.findProjectUsingFile(targetFile);
        if (!targetProject) {
            targetProject = this.findProjectUsingFile(path.join(targetFile, 'src', 'index'));
        }
        return targetProject;
    };
    EnforceModuleBoundariesWalker.prototype.findProjectUsingFile = function (file) {
        return this.projectNodes.filter(function (n) { return containsFile(n.files, file); })[0];
    };
    EnforceModuleBoundariesWalker.prototype.findProjectUsingImport = function (imp) {
        var unscopedImport = imp.substring(this.npmScope.length + 2);
        return this.projectNodes.filter(function (n) {
            var normalizedRoot = shared_1.normalizedProjectRoot(n);
            return (unscopedImport === normalizedRoot ||
                unscopedImport.startsWith(normalizedRoot + "/"));
        })[0];
    };
    EnforceModuleBoundariesWalker.prototype.isAbsoluteImportIntoAnotherProject = function (imp) {
        return (imp.startsWith('libs/') ||
            imp.startsWith('/libs/') ||
            imp.startsWith('apps/') ||
            imp.startsWith('/apps/'));
    };
    EnforceModuleBoundariesWalker.prototype.isRelative = function (s) {
        return s.startsWith('.');
    };
    EnforceModuleBoundariesWalker.prototype.findConstraintsFor = function (sourceProject) {
        return this.depConstraints.filter(function (f) { return hasTag(sourceProject, f.sourceTag); });
    };
    return EnforceModuleBoundariesWalker;
}(Lint.RuleWalker));
function hasNoneOfTheseTags(proj, tags) {
    return tags.filter(function (allowedTag) { return hasTag(proj, allowedTag); }).length === 0;
}
function hasTag(proj, tag) {
    return (proj.tags || []).indexOf(tag) > -1 || tag === '*';
}
function containsFile(files, targetFileWithoutExtension) {
    return !!files.filter(function (f) { return removeExt(f) === targetFileWithoutExtension; })[0];
}
function removeExt(file) {
    return file.replace(/\.[^/.]+$/, '');
}
