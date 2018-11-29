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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var shared_1 = require("./shared");
var path = require("path");
var resolve = require("resolve");
var runAll = require("npm-run-all");
var dep_graph_1 = require("./dep-graph");
var workspace_results_1 = require("./workspace-results");
var fs = require("fs");
// Commands that can do `ng [command]`
var ngCommands = ['build', 'test', 'lint', 'e2e'];
function affected(parsedArgs) {
    var apps;
    var libs;
    var projects;
    var target = parsedArgs.target;
    var rest = parsedArgs._.slice(1).concat(filterNxSpecificArgs(parsedArgs));
    var workspaceResults = new workspace_results_1.WorkspaceResults(target);
    try {
        if (parsedArgs.all) {
            apps = shared_1.getAllAppNames()
                .filter(function (app) { return !parsedArgs.exclude.includes(app); })
                .filter(function (project) {
                return !parsedArgs.onlyFailed || !workspaceResults.getResult(project);
            });
            libs = shared_1.getAllLibNames()
                .filter(function (app) { return !parsedArgs.exclude.includes(app); })
                .filter(function (project) {
                return !parsedArgs.onlyFailed || !workspaceResults.getResult(project);
            });
            projects = shared_1.getAllProjectNames()
                .filter(function (project) { return !parsedArgs.exclude.includes(project); })
                .filter(function (project) {
                return !parsedArgs.onlyFailed || !workspaceResults.getResult(project);
            });
        }
        else {
            var p = shared_1.parseFiles(parsedArgs);
            apps = shared_1.getAffectedApps(p.files)
                .filter(function (project) { return !parsedArgs.exclude.includes(project); })
                .filter(function (project) {
                return !parsedArgs.onlyFailed || !workspaceResults.getResult(project);
            });
            libs = shared_1.getAffectedLibs(p.files)
                .filter(function (project) { return !parsedArgs.exclude.includes(project); })
                .filter(function (project) {
                return !parsedArgs.onlyFailed || !workspaceResults.getResult(project);
            });
            projects = shared_1.getAffectedProjects(p.files)
                .filter(function (project) { return !parsedArgs.exclude.includes(project); })
                .filter(function (project) {
                return !parsedArgs.onlyFailed || !workspaceResults.getResult(project);
            });
        }
    }
    catch (e) {
        printError(e);
        process.exit(1);
    }
    switch (target) {
        case 'apps':
            console.log(apps.join(' '));
            break;
        case 'libs':
            console.log(libs.join(' '));
            break;
        case 'dep-graph':
            dep_graph_1.generateGraph(parsedArgs, projects);
            break;
        default:
            var targetProjects = getProjects(target, parsedArgs, workspaceResults, parsedArgs.all);
            runCommand(target, targetProjects, parsedArgs, rest, workspaceResults, "Running " + target + " for", "Running " + target + " for affected projects succeeded.", "Running " + target + " for affected projects failed.");
            break;
    }
}
exports.affected = affected;
function getProjects(target, parsedArgs, workspaceResults, all) {
    var projects = all
        ? shared_1.getAllProjectNamesWithTarget(target)
        : shared_1.getAffectedProjectsWithTarget(target)(shared_1.parseFiles(parsedArgs).files);
    return projects
        .filter(function (project) { return !parsedArgs.exclude.includes(project); })
        .filter(function (project) { return !parsedArgs.onlyFailed || !workspaceResults.getResult(project); });
}
function printError(e) {
    console.error(e.message);
}
function runCommand(command, projects, parsedArgs, args, workspaceResults, iterationMessage, successMessage, errorMessage) {
    return __awaiter(this, void 0, void 0, function () {
        var depGraph, sortedProjects, message, packageJson, e_1, failedProjects_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (projects.length <= 0) {
                        console.log("No projects to run " + command);
                        return [2 /*return*/];
                    }
                    depGraph = shared_1.readDepGraph();
                    sortedProjects = topologicallySortProjects(depGraph);
                    projects = sortedProjects.filter(function (p) { return projects.includes(p); });
                    message = iterationMessage + " projects:\n  " + projects.join(',\n  ');
                    console.log(message);
                    if (args.length > 0) {
                        console.log("With flags: " + args.join(' '));
                    }
                    if (!parsedArgs.parallel) return [3 /*break*/, 5];
                    packageJson = JSON.parse(fs.readFileSync('./package.json').toString('utf-8'));
                    if (!packageJson.scripts || !packageJson.scripts.ng) {
                        console.error('\nError: Your `package.json` file should contain the `ng: "ng"` command in the `scripts` section.\n');
                        return [2 /*return*/, process.exit(1)];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, runAll(projects.map(function (app) {
                            return ngCommands.includes(command)
                                ? "ng -- " + command + " --project=" + app + " " + args.join(' ') + " "
                                : "ng -- run " + app + ":" + command + " " + args.join(' ') + " ";
                        }), {
                            parallel: parsedArgs.parallel,
                            maxParallel: parsedArgs.maxParallel,
                            continueOnError: true,
                            stdin: process.stdin,
                            stdout: process.stdout,
                            stderr: process.stderr
                        })];
                case 2:
                    _a.sent();
                    projects.forEach(function (project) {
                        workspaceResults.success(project);
                    });
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    e_1.results.forEach(function (result, i) {
                        if (result.code === 0) {
                            workspaceResults.success(projects[i]);
                        }
                        else {
                            workspaceResults.fail(projects[i]);
                        }
                    });
                    return [3 /*break*/, 4];
                case 4:
                    workspaceResults.saveResults();
                    workspaceResults.printResults(parsedArgs.onlyFailed, successMessage, errorMessage);
                    if (workspaceResults.hasFailure) {
                        process.exit(1);
                    }
                    return [3 /*break*/, 6];
                case 5:
                    failedProjects_1 = [];
                    projects.forEach(function (project) {
                        console.log(iterationMessage + " " + project);
                        var task = ngCommands.includes(command)
                            ? "node " + ngPath() + " " + command + " --project=" + project + " " + args.join(' ') + " "
                            : "node " + ngPath() + " run " + project + ":" + command + " " + args.join(' ') + " ";
                        try {
                            child_process_1.execSync(task, {
                                stdio: [0, 1, 2]
                            });
                            workspaceResults.success(project);
                        }
                        catch (e) {
                            failedProjects_1.push(project);
                            workspaceResults.fail(project);
                        }
                    });
                    workspaceResults.saveResults();
                    workspaceResults.printResults(parsedArgs.onlyFailed, successMessage, errorMessage);
                    if (workspaceResults.hasFailure) {
                        process.exit(1);
                    }
                    _a.label = 6;
                case 6: return [2 /*return*/];
            }
        });
    });
}
function topologicallySortProjects(deps) {
    var temporary = {};
    var marked = {};
    var res = [];
    while (Object.keys(marked).length !== deps.projects.length) {
        visit(deps.projects.find(function (p) { return !marked[p.name]; }));
    }
    function visit(n) {
        if (marked[n.name])
            return;
        if (temporary[n.name])
            return;
        temporary[n.name] = true;
        deps.deps[n.name].forEach(function (e) {
            visit(deps.projects.find(function (pp) { return pp.name === e.projectName; }));
        });
        marked[n.name] = true;
        res.push(n.name);
    }
    return res;
}
function filterNxSpecificArgs(parsedArgs) {
    var filteredArgs = __assign({}, parsedArgs);
    // Delete Nx arguments from parsed Args
    nxSpecificFlags.forEach(function (flag) {
        delete filteredArgs[flag];
    });
    // These would be arguments such as app2 in  --app app1 app2 which the CLI does not accept
    delete filteredArgs._;
    // Also remove the node path
    delete filteredArgs.$0;
    // Re-serialize into a list of args
    return Object.keys(filteredArgs).map(function (filteredArg) {
        if (!Array.isArray(filteredArgs[filteredArg])) {
            filteredArgs[filteredArg] = [filteredArgs[filteredArg]];
        }
        return filteredArgs[filteredArg]
            .map(function (value) {
            return "--" + filteredArg + "=" + value;
        })
            .join(' ');
    });
}
function ngPath() {
    var basePath = path.dirname(path.dirname(path.dirname(resolve.sync('@angular/cli', { basedir: __dirname }))));
    return "\"" + path.join(basePath, 'bin', 'ng') + "\"";
}
/**
 * These options are only for getting an array with properties of AffectedOptions.
 *
 * @remark They are not defaults or useful for anything else
 */
var dummyOptions = {
    target: '',
    parallel: false,
    maxParallel: 3,
    'max-parallel': false,
    onlyFailed: false,
    'only-failed': false,
    untracked: false,
    uncommitted: false,
    help: false,
    version: false,
    quiet: false,
    all: false,
    base: 'base',
    head: 'head',
    exclude: ['exclude'],
    files: ['']
};
var nxSpecificFlags = Object.keys(dummyOptions);
