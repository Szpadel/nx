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
var _a, _b, _c, _d, _e, _f, _g, _h;
var fileutils_1 = require("../utils/fileutils");
var graphviz = require("graphviz");
var appRoot = require("app-root-path");
var opn = require("opn");
var fs_1 = require("fs");
var affected_apps_1 = require("./affected-apps");
var shared_1 = require("./shared");
var path = require("path");
var tmp_1 = require("tmp");
var viz = require('viz.js'); // typings are incorrect in viz.js library - need to use `require`
var NodeEdgeVariant;
(function (NodeEdgeVariant) {
    NodeEdgeVariant["default"] = "default";
    NodeEdgeVariant["highlighted"] = "highlighted";
})(NodeEdgeVariant = exports.NodeEdgeVariant || (exports.NodeEdgeVariant = {}));
var OutputType;
(function (OutputType) {
    OutputType["json"] = "json";
    OutputType["html"] = "html";
    OutputType["dot"] = "dot";
    OutputType["svg"] = "svg";
})(OutputType = exports.OutputType || (exports.OutputType = {}));
var defaultConfig = {
    isFilePresent: false,
    filename: undefined,
    type: OutputType.html,
    shouldOpen: true
};
exports.graphvizConfig = {
    graph: [
        {
            attr: 'overlap',
            value: false
        },
        {
            attr: 'pad',
            value: 0.111
        }
    ],
    nodes: (_a = {},
        _a[affected_apps_1.ProjectType.e2e] = (_b = {},
            _b[NodeEdgeVariant.default] = {
                fontname: 'Arial',
                fontsize: 14,
                shape: 'box'
            },
            _b[NodeEdgeVariant.highlighted] = {
                fontname: 'Arial',
                fontsize: 14,
                shape: 'box',
                color: '#FF0033'
            },
            _b),
        _a[affected_apps_1.ProjectType.app] = (_c = {},
            _c[NodeEdgeVariant.default] = {
                fontname: 'Arial',
                fontsize: 14,
                shape: 'box'
            },
            _c[NodeEdgeVariant.highlighted] = {
                fontname: 'Arial',
                fontsize: 14,
                shape: 'box',
                color: '#FF0033'
            },
            _c),
        _a[affected_apps_1.ProjectType.lib] = (_d = {},
            _d[NodeEdgeVariant.default] = {
                fontname: 'Arial',
                fontsize: 14,
                style: 'filled',
                fillcolor: '#EFEFEF'
            },
            _d[NodeEdgeVariant.highlighted] = {
                fontname: 'Arial',
                fontsize: 14,
                style: 'filled',
                fillcolor: '#EFEFEF',
                color: '#FF0033'
            },
            _d),
        _a),
    edges: (_e = {},
        _e[affected_apps_1.DependencyType.es6Import] = (_f = {},
            _f[NodeEdgeVariant.default] = {
                color: '#757575'
            },
            _f[NodeEdgeVariant.highlighted] = {
                color: '#FF0033'
            },
            _f),
        _e[affected_apps_1.DependencyType.loadChildren] = (_g = {},
            _g[NodeEdgeVariant.default] = {
                color: '#757575',
                style: 'dotted'
            },
            _g[NodeEdgeVariant.highlighted] = {
                color: '#FF0033',
                style: 'dotted'
            },
            _g),
        _e[affected_apps_1.DependencyType.implicit] = (_h = {},
            _h[NodeEdgeVariant.default] = {
                color: '#000000',
                style: 'bold'
            },
            _h[NodeEdgeVariant.highlighted] = {
                color: '#FF0033',
                style: 'bold'
            },
            _h),
        _e)
};
function mapProjectNodes(projects) {
    return projects.reduce(function (m, proj) {
        var _a;
        return (__assign({}, m, (_a = {}, _a[proj.name] = proj, _a)));
    }, {});
}
function getVariant(map, key) {
    return map[key] ? NodeEdgeVariant.highlighted : NodeEdgeVariant.default;
}
function getNodeProps(config, projectNode, criticalPath) {
    var nodeProps = config[projectNode.type];
    return nodeProps[getVariant(criticalPath, projectNode.name)];
}
function getEdgeProps(config, depType, child, criticalPath) {
    var edgeProps = config[depType];
    return edgeProps[getVariant(criticalPath, child)];
}
function createGraphviz(config, deps, projects, criticalPath) {
    var projectMap = mapProjectNodes(projects);
    var g = graphviz.digraph('G');
    config.graph.forEach(function (_a) {
        var attr = _a.attr, value = _a.value;
        return g.set(attr, value);
    });
    Object.keys(deps)
        .sort() // sorting helps with testing
        .forEach(function (key) {
        var projectNode = projectMap[key];
        var dependencies = deps[key];
        g.addNode(key, getNodeProps(config.nodes, projectNode, criticalPath));
        if (dependencies.length > 0) {
            dependencies.forEach(function (dep, i) {
                g.addNode(dep.projectName, getNodeProps(config.nodes, projectMap[dep.projectName], criticalPath)); // child node
                g.addEdge(key, dep.projectName, getEdgeProps(config.edges, dep.type, dep.projectName, criticalPath));
            });
        }
    });
    return g.to_dot();
}
exports.createGraphviz = createGraphviz;
function handleOutput(_a) {
    var data = _a.data, shouldOpen = _a.shouldOpen, shouldWriteToFile = _a.shouldWriteToFile, filename = _a.filename;
    if (shouldOpen) {
        var tmpFilename = tmp_1.tmpNameSync() + ".html";
        fileutils_1.writeToFile(tmpFilename, data);
        opn(tmpFilename, {
            wait: false
        });
    }
    else if (!shouldWriteToFile) {
        return console.log(data);
    }
    else {
        fileutils_1.writeToFile(filename, data);
    }
}
function applyHTMLTemplate(svg) {
    return "<!DOCTYPE html>\n  <html>\n    <head><title></title></head>\n    <body>" + svg + "</body>\n  </html>\n  ";
}
function generateGraphJson(criticalPath) {
    var angularJson = shared_1.readAngularJson();
    var nxJson = shared_1.readNxJson();
    var npmScope = nxJson.npmScope;
    var projects = shared_1.getProjectNodes(angularJson, nxJson);
    // fetch all apps and libs
    var deps = affected_apps_1.dependencies(npmScope, projects, function (f) {
        return fs_1.readFileSync(appRoot.path + "/" + f, 'utf-8');
    });
    return {
        deps: deps,
        criticalPath: criticalPath
    };
}
function getDot(json) {
    var angularJson = shared_1.readAngularJson();
    var nxJson = shared_1.readNxJson();
    var projects = shared_1.getProjectNodes(angularJson, nxJson);
    return createGraphviz(exports.graphvizConfig, json.deps, projects, json.criticalPath.reduce(function (m, proj) {
        var _a;
        return (__assign({}, m, (_a = {}, _a[proj] = true, _a)));
    }, {}));
}
function getConfigFromUserInput(cmdOpts) {
    var filename = cmdOpts.file;
    var output = cmdOpts.output;
    if (filename && output) {
        throw new Error('Received both filename as well as output type. Please only specify one of the options.');
    }
    var extension = !!filename
        ? path.extname(filename).substring(1)
        : output || OutputType.html;
    return {
        isFilePresent: !output,
        type: extension,
        output: output,
        shouldOpen: !output && !filename,
        filename: filename
    };
}
function extractDataFromJson(json, type) {
    switch (type) {
        case OutputType.json:
            return JSON.stringify(json, null, 2);
        case OutputType.dot:
            return getDot(json);
        case OutputType.html:
            return applyHTMLTemplate(viz(getDot(json)));
        case OutputType.svg:
            return viz(getDot(json));
        default:
            throw new Error('Unrecognized file extension. Supported extensions are "json", "html", and "dot"');
    }
}
function generateGraph(args, criticalPath) {
    var json = generateGraphJson(criticalPath || []);
    var config = __assign({}, defaultConfig, getConfigFromUserInput(args));
    handleOutput({
        data: extractDataFromJson(json, config.type),
        filename: config.filename,
        shouldWriteToFile: config.isFilePresent,
        shouldOpen: config.shouldOpen
    });
}
exports.generateGraph = generateGraph;
