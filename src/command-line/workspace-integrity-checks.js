"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WorkspaceIntegrityChecks = /** @class */ (function () {
    function WorkspaceIntegrityChecks(projectNodes, files, packageJson) {
        this.projectNodes = projectNodes;
        this.files = files;
        this.packageJson = packageJson;
    }
    WorkspaceIntegrityChecks.prototype.run = function () {
        return this.packageJsonConsistencyCheck().concat(this.projectWithoutFilesCheck(), this.filesWithoutProjects());
    };
    WorkspaceIntegrityChecks.prototype.packageJsonConsistencyCheck = function () {
        var nx = this.packageJson.dependencies['@nrwl/nx'];
        var schematics = this.packageJson.devDependencies['@nrwl/schematics'];
        if (nx !== schematics) {
            return [
                {
                    header: 'The package.json is inconsistent',
                    errors: [
                        'The versions of the @nrwl/nx and @nrwl/schematics packages must be the same.'
                    ]
                }
            ];
        }
        else {
            return [];
        }
    };
    WorkspaceIntegrityChecks.prototype.projectWithoutFilesCheck = function () {
        var errors = this.projectNodes
            .filter(function (n) { return n.files.length === 0; })
            .map(function (p) { return "Cannot find project '" + p.name + "' in '" + p.root + "'"; });
        return errors.length === 0
            ? []
            : [{ header: 'The angular.json file is out of sync', errors: errors }];
    };
    WorkspaceIntegrityChecks.prototype.filesWithoutProjects = function () {
        var allFilesFromProjects = this.allProjectFiles();
        var allFilesWithoutProjects = minus(this.files, allFilesFromProjects);
        var first5FilesWithoutProjects = allFilesWithoutProjects.length > 5
            ? allFilesWithoutProjects.slice(0, 5)
            : allFilesWithoutProjects;
        var errors = first5FilesWithoutProjects.map(function (p) { return "The '" + p + "' file doesn't belong to any project."; });
        return errors.length === 0
            ? []
            : [
                {
                    header: "All files in 'apps' and 'libs' must be part of a project.",
                    errors: errors
                }
            ];
    };
    WorkspaceIntegrityChecks.prototype.allProjectFiles = function () {
        return this.projectNodes.reduce(function (m, c) { return m.concat(c.files); }, []);
    };
    return WorkspaceIntegrityChecks;
}());
exports.WorkspaceIntegrityChecks = WorkspaceIntegrityChecks;
function minus(a, b) {
    return a.filter(function (aa) { return b.indexOf(aa) === -1; });
}
