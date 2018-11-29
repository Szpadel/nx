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
var child_process_1 = require("child_process");
var path = require("path");
var affected_apps_1 = require("./affected-apps");
var fs = require("fs");
var fs_1 = require("fs");
var appRoot = require("app-root-path");
var fileutils_1 = require("../utils/fileutils");
function parseFiles(options) {
    var files = options.files, uncommitted = options.uncommitted, untracked = options.untracked, base = options.base, head = options.head;
    if (files) {
        return {
            files: files
        };
    }
    else if (uncommitted) {
        return {
            files: getUncommittedFiles()
        };
    }
    else if (untracked) {
        return {
            files: getUntrackedFiles()
        };
    }
    else if (base && head) {
        return {
            files: getFilesUsingBaseAndHead(base, head)
        };
    }
    else if (base) {
        return {
            files: Array.from(new Set(getFilesUsingBaseAndHead(base, 'HEAD').concat(getUncommittedFiles(), getUntrackedFiles())))
        };
    }
    else if (options._.length >= 2) {
        return {
            files: getFilesFromShash(options._[1], options._[2])
        };
    }
    else {
        throw new Error('Invalid options provided');
    }
}
exports.parseFiles = parseFiles;
function getUncommittedFiles() {
    return parseGitOutput("git diff --name-only HEAD .");
}
function getUntrackedFiles() {
    return parseGitOutput("git ls-files --others --exclude-standard");
}
function getFilesUsingBaseAndHead(base, head) {
    var mergeBase = child_process_1.execSync("git merge-base " + base + " " + head)
        .toString()
        .trim();
    return parseGitOutput("git diff --name-only " + mergeBase + " " + head);
}
function getFilesFromShash(sha1, sha2) {
    return parseGitOutput("git diff --name-only " + sha1 + " " + sha2);
}
function parseGitOutput(command) {
    return child_process_1.execSync(command)
        .toString('utf-8')
        .split('\n')
        .map(function (a) { return a.trim(); })
        .filter(function (a) { return a.length > 0; });
}
function getFileLevelImplicitDependencies(angularJson, nxJson) {
    if (!nxJson.implicitDependencies) {
        return {};
    }
    var projects = getProjectNodes(angularJson, nxJson);
    Object.entries(nxJson.implicitDependencies).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        if (value === '*') {
            nxJson.implicitDependencies[key] = projects.map(function (p) { return p.name; });
        }
    });
    return nxJson.implicitDependencies;
}
function getProjectLevelImplicitDependencies(angularJson, nxJson) {
    var projects = getProjectNodes(angularJson, nxJson);
    var implicitDependencies = projects.reduce(function (memo, project) {
        project.implicitDependencies.forEach(function (dep) {
            if (memo[dep]) {
                memo[dep].add(project.name);
            }
            else {
                memo[dep] = new Set([project.name]);
            }
        });
        return memo;
    }, {});
    return Object.entries(implicitDependencies).reduce(function (memo, _a) {
        var key = _a[0], val = _a[1];
        memo[key] = Array.from(val);
        return memo;
    }, {});
}
function detectAndSetInvalidProjectValues(map, sourceName, desiredProjectNames, validProjects) {
    var invalidProjects = desiredProjectNames.filter(function (projectName) { return !validProjects[projectName]; });
    if (invalidProjects.length > 0) {
        map.set(sourceName, invalidProjects);
    }
}
function getImplicitDependencies(angularJson, nxJson) {
    assertWorkspaceValidity(angularJson, nxJson);
    var files = getFileLevelImplicitDependencies(angularJson, nxJson);
    var projects = getProjectLevelImplicitDependencies(angularJson, nxJson);
    return {
        files: files,
        projects: projects
    };
}
exports.getImplicitDependencies = getImplicitDependencies;
function assertWorkspaceValidity(angularJson, nxJson) {
    var angularJsonProjects = Object.keys(angularJson.projects);
    var nxJsonProjects = Object.keys(nxJson.projects);
    if (minus(angularJsonProjects, nxJsonProjects).length > 0) {
        throw new Error("angular.json and nx.json are out of sync. The following projects are missing in nx.json: " + minus(angularJsonProjects, nxJsonProjects).join(', '));
    }
    if (minus(nxJsonProjects, angularJsonProjects).length > 0) {
        throw new Error("angular.json and nx.json are out of sync. The following projects are missing in angular.json: " + minus(nxJsonProjects, angularJsonProjects).join(', '));
    }
    var projects = __assign({}, angularJson.projects, nxJson.projects);
    var invalidImplicitDependencies = new Map();
    Object.entries(nxJson.implicitDependencies || {})
        .filter(function (_a) {
        var _ = _a[0], val = _a[1];
        return val !== '*';
    }) // These are valid since it is calculated
        .reduce(function (map, _a) {
        var filename = _a[0], projectNames = _a[1];
        detectAndSetInvalidProjectValues(map, filename, projectNames, projects);
        return map;
    }, invalidImplicitDependencies);
    nxJsonProjects
        .filter(function (nxJsonProjectName) {
        var project = nxJson.projects[nxJsonProjectName];
        return !!project.implicitDependencies;
    })
        .reduce(function (map, nxJsonProjectName) {
        var project = nxJson.projects[nxJsonProjectName];
        detectAndSetInvalidProjectValues(map, nxJsonProjectName, project.implicitDependencies, projects);
        return map;
    }, invalidImplicitDependencies);
    if (invalidImplicitDependencies.size === 0) {
        return;
    }
    var message = "The following implicitDependencies specified in nx.json are invalid:\n  ";
    invalidImplicitDependencies.forEach(function (projectNames, key) {
        var str = "  " + key + "\n    " + projectNames.map(function (projectName) { return "    " + projectName; }).join('\n');
        message += str;
    });
    throw new Error(message);
}
exports.assertWorkspaceValidity = assertWorkspaceValidity;
function getProjectNodes(angularJson, nxJson) {
    assertWorkspaceValidity(angularJson, nxJson);
    var angularJsonProjects = Object.keys(angularJson.projects);
    return angularJsonProjects.map(function (key) {
        var p = angularJson.projects[key];
        var tags = nxJson.projects[key].tags;
        var projectType = p.projectType === 'application'
            ? key.endsWith('-e2e') ? affected_apps_1.ProjectType.e2e : affected_apps_1.ProjectType.app
            : affected_apps_1.ProjectType.lib;
        var implicitDependencies = nxJson.projects[key].implicitDependencies || [];
        if (projectType === affected_apps_1.ProjectType.e2e && implicitDependencies.length === 0) {
            implicitDependencies = [key.replace(/-e2e$/, '')];
        }
        return {
            name: key,
            root: p.root,
            type: projectType,
            tags: tags,
            architect: p.architect || {},
            files: allFilesInDir(appRoot.path + "/" + p.root),
            implicitDependencies: implicitDependencies
        };
    });
}
exports.getProjectNodes = getProjectNodes;
function minus(a, b) {
    var res = [];
    a.forEach(function (aa) {
        if (!b.find(function (bb) { return bb === aa; })) {
            res.push(aa);
        }
    });
    return res;
}
function readAngularJson() {
    return fileutils_1.readJsonFile(appRoot.path + "/angular.json");
}
exports.readAngularJson = readAngularJson;
function readNxJson() {
    var config = fileutils_1.readJsonFile(appRoot.path + "/nx.json");
    if (!config.npmScope) {
        throw new Error("nx.json must define the npmScope property.");
    }
    return config;
}
exports.readNxJson = readNxJson;
exports.getAffected = function (affectedNamesFetcher) { return function (touchedFiles) {
    var angularJson = readAngularJson();
    var nxJson = readNxJson();
    var projects = getProjectNodes(angularJson, nxJson);
    var implicitDeps = getImplicitDependencies(angularJson, nxJson);
    return affectedNamesFetcher(nxJson.npmScope, projects, implicitDeps, function (f) { return fs.readFileSync(appRoot.path + "/" + f, 'utf-8'); }, touchedFiles);
}; };
function getAffectedProjectsWithTarget(target) {
    return exports.getAffected(affected_apps_1.affectedProjectNamesWithTarget(target));
}
exports.getAffectedProjectsWithTarget = getAffectedProjectsWithTarget;
exports.getAffectedApps = exports.getAffected(affected_apps_1.affectedAppNames);
exports.getAffectedProjects = exports.getAffected(affected_apps_1.affectedProjectNames);
exports.getAffectedLibs = exports.getAffected(affected_apps_1.affectedLibNames);
function getTouchedProjects(touchedFiles) {
    var angularJson = readAngularJson();
    var nxJson = readNxJson();
    var projects = getProjectNodes(angularJson, nxJson);
    var implicitDeps = getImplicitDependencies(angularJson, nxJson);
    return affected_apps_1.touchedProjects(implicitDeps, projects, touchedFiles).filter(function (p) { return !!p; });
}
exports.getTouchedProjects = getTouchedProjects;
function getAllAppNames() {
    var projects = getProjectNodes(readAngularJson(), readNxJson());
    return projects.filter(function (p) { return p.type === affected_apps_1.ProjectType.app; }).map(function (p) { return p.name; });
}
exports.getAllAppNames = getAllAppNames;
function getAllLibNames() {
    var projects = getProjectNodes(readAngularJson(), readNxJson());
    return projects.filter(function (p) { return p.type === affected_apps_1.ProjectType.lib; }).map(function (p) { return p.name; });
}
exports.getAllLibNames = getAllLibNames;
function getAllProjectNamesWithTarget(target) {
    var projects = getProjectNodes(readAngularJson(), readNxJson());
    return projects.filter(function (p) { return p.architect[target]; }).map(function (p) { return p.name; });
}
exports.getAllProjectNamesWithTarget = getAllProjectNamesWithTarget;
function getAllProjectNames() {
    var projects = getProjectNodes(readAngularJson(), readNxJson());
    return projects.map(function (p) { return p.name; });
}
exports.getAllProjectNames = getAllProjectNames;
function getProjectRoots(projectNames) {
    var projects = readAngularJson().projects;
    return projectNames.map(function (name) { return projects[name].root; });
}
exports.getProjectRoots = getProjectRoots;
function allFilesInDir(dirName) {
    // Ignore files in nested node_modules directories
    if (dirName.endsWith('node_modules')) {
        return [];
    }
    var res = [];
    try {
        fs.readdirSync(dirName).forEach(function (c) {
            var child = path.join(dirName, c);
            try {
                if (!fs.statSync(child).isDirectory()) {
                    // add starting with "apps/myapp/..." or "libs/mylib/..."
                    res.push(normalizePath(path.relative(appRoot.path, child)));
                }
                else if (fs.statSync(child).isDirectory()) {
                    res = res.concat(allFilesInDir(child));
                }
            }
            catch (e) { }
        });
    }
    catch (e) { }
    return res;
}
exports.allFilesInDir = allFilesInDir;
function readDependencies(npmScope, projectNodes) {
    var m = lastModifiedAmongProjectFiles();
    if (!directoryExists(appRoot.path + "/dist")) {
        fs.mkdirSync(appRoot.path + "/dist");
    }
    if (!fileExists(appRoot.path + "/dist/nxdeps.json") ||
        m > mtime(appRoot.path + "/dist/nxdeps.json")) {
        var deps = affected_apps_1.dependencies(npmScope, projectNodes, function (f) {
            return fs.readFileSync(appRoot.path + "/" + f, 'UTF-8');
        });
        fs.writeFileSync(appRoot.path + "/dist/nxdeps.json", JSON.stringify(deps, null, 2), 'UTF-8');
        return deps;
    }
    else {
        return fileutils_1.readJsonFile(appRoot.path + "/dist/nxdeps.json");
    }
}
exports.readDependencies = readDependencies;
function readDepGraph() {
    var angularJson = readAngularJson();
    var nxJson = readNxJson();
    var projectNodes = getProjectNodes(angularJson, nxJson);
    return {
        npmScope: nxJson.npmScope,
        projects: projectNodes,
        deps: readDependencies(nxJson.npmScope, projectNodes)
    };
}
exports.readDepGraph = readDepGraph;
function lastModifiedAmongProjectFiles() {
    return [
        recursiveMtime(appRoot.path + "/libs"),
        recursiveMtime(appRoot.path + "/apps"),
        mtime(appRoot.path + "/angular.json"),
        mtime(appRoot.path + "/nx.json"),
        mtime(appRoot.path + "/tslint.json"),
        mtime(appRoot.path + "/package.json")
    ].reduce(function (a, b) { return (a > b ? a : b); }, 0);
}
exports.lastModifiedAmongProjectFiles = lastModifiedAmongProjectFiles;
function recursiveMtime(dirName) {
    var res = mtime(dirName);
    fs.readdirSync(dirName).forEach(function (c) {
        var child = path.join(dirName, c);
        try {
            if (!fs.statSync(child).isDirectory()) {
                var c_1 = mtime(child);
                if (c_1 > res) {
                    res = c_1;
                }
            }
            else if (fs.statSync(child).isDirectory()) {
                var c_2 = recursiveMtime(child);
                if (c_2 > res) {
                    res = c_2;
                }
            }
        }
        catch (e) { }
    });
    return res;
}
function mtime(f) {
    var fd = fs.openSync(f, 'r');
    try {
        return fs.fstatSync(fd).mtime.getTime();
    }
    finally {
        fs.closeSync(fd);
    }
}
function normalizePath(file) {
    return file.split(path.sep).join('/');
}
function directoryExists(filePath) {
    try {
        return fs_1.statSync(filePath).isDirectory();
    }
    catch (err) {
        return false;
    }
}
function fileExists(filePath) {
    try {
        return fs_1.statSync(filePath).isFile();
    }
    catch (err) {
        return false;
    }
}
function normalizedProjectRoot(p) {
    return p.root
        .split('/')
        .filter(function (v) { return !!v; })
        .slice(1)
        .join('/');
}
exports.normalizedProjectRoot = normalizedProjectRoot;
