#!/usr/bin/env node
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
var yargs = require("yargs");
var affected_1 = require("./affected");
var format_1 = require("./format");
var update_1 = require("./update");
var lint_1 = require("./lint");
var workspace_schematic_1 = require("./workspace-schematic");
var dep_graph_1 = require("./dep-graph");
var noop = function (yargs) { return yargs; };
var ɵ0 = noop;
exports.ɵ0 = ɵ0;
yargs
    .usage('Nrwl Extensions for Angular')
    .command('affected', 'Run task for affected projects', function (yargs) { return withAffectedOptions(withParallel(yargs)); }, function (args) { return affected_1.affected(args); })
    .command('affected:apps', 'Print applications affected by changes', withAffectedOptions, function (args) {
    return affected_1.affected(__assign({}, args, { target: 'apps' }));
})
    .command('affected:libs', 'Print libraries affected by changes', withAffectedOptions, function (args) {
    return affected_1.affected(__assign({}, args, { target: 'libs' }));
})
    .command('affected:build', 'Build applications and publishable libraries affected by changes', function (yargs) { return withAffectedOptions(withParallel(yargs)); }, function (args) {
    return affected_1.affected(__assign({}, args, { target: 'build' }));
})
    .command('affected:test', 'Test projects affected by changes', function (yargs) { return withAffectedOptions(withParallel(yargs)); }, function (args) {
    return affected_1.affected(__assign({}, args, { target: 'test' }));
})
    .command('affected:e2e', 'Run e2e tests for the applications affected by changes', withAffectedOptions, function (args) {
    return affected_1.affected(__assign({}, args, { target: 'e2e' }));
})
    .command('affected:dep-graph', 'Graph dependencies affected by changes', function (yargs) { return withAffectedOptions(withDepGraphOptions(yargs)); }, function (args) {
    return affected_1.affected(__assign({}, args, { target: 'dep-graph' }));
})
    .command('affected:lint', 'Lint projects affected by changes', function (yargs) { return withAffectedOptions(withParallel(yargs)); }, function (args) {
    return affected_1.affected(__assign({}, args, { target: 'lint' }));
})
    .command('dep-graph', 'Graph dependencies within workspace', function (yargs) { return withAffectedOptions(withDepGraphOptions(yargs)); }, function (args) { return dep_graph_1.generateGraph(args); })
    .command('format:check', 'Check for un-formatted files', withFormatOptions, function (args) { return format_1.format('check', args); })
    .command('format:write', 'Overwrite un-formatted files', withFormatOptions, function (args) { return format_1.format('write', args); })
    .alias('format:write', 'format')
    .command('lint [files..]', 'Lint workspace or list of files', noop, function (_) {
    return lint_1.lint();
})
    .command('update:check', 'Check for workspace updates', noop, function (_) {
    return update_1.update(['check']);
})
    .command('update:skip', 'Skip workspace updates', noop, function (_) { return update_1.update(['skip']); })
    .command('update', 'Update workspace', noop, function (_) { return update_1.update([]); })
    .alias('update', 'migrates') // TODO: Remove after 1.0
    .command('workspace-schematic <name>', 'Runs a workspace schematic from the tools/schematics directory', function (yargs) {
    return yargs.positional('name', {
        type: 'string',
        describe: 'The name of your schematic`'
    });
}, function () { return workspace_schematic_1.workspaceSchematic(process.argv.slice(3)); })
    .help('help')
    .version()
    .option('quiet', { type: 'boolean', hidden: true })
    .demandCommand().argv; // .argv bootstraps the CLI creation;
function withFormatOptions(yargs) {
    return withAffectedOptions(yargs).option('apps-and-libs', {
        type: 'boolean'
    });
}
function withAffectedOptions(yargs) {
    return yargs
        .option('files', {
        describe: 'A list of files delimited by commas',
        type: 'array',
        requiresArg: true,
        coerce: parseCSV
    })
        .option('uncommitted', { describe: 'Uncommitted changes' })
        .option('untracked', { describe: 'Untracked changes' })
        .option('all', { describe: 'All projects' })
        .option('base', {
        describe: 'Base of the current branch (usually master)',
        type: 'string',
        requiresArg: true
    })
        .option('head', {
        describe: 'Latest commit of the current branch (usually HEAD)',
        type: 'string',
        requiresArg: true
    })
        .group(['base'], 'Run command using --base=[SHA1] (affected by the committed, uncommitted and untracked changes):')
        .group(['base', 'head'], 'or using --base=[SHA1] --head=[SHA2] (affected by the committed changes):')
        .group(['files', 'uncommitted', 'untracked'], 'or using:')
        .implies('head', 'base')
        .nargs('uncommitted', 0)
        .nargs('untracked', 0)
        .nargs('all', 0)
        .option('exclude', {
        describe: 'Exclude certain projects from being processed',
        type: 'array',
        coerce: parseCSV,
        default: []
    })
        .options('only-failed', {
        describe: 'Isolate projects which previously failed',
        type: 'boolean',
        default: false
    })
        .conflicts({
        files: ['uncommitted', 'untracked', 'base', 'head', 'all'],
        untracked: ['uncommitted', 'files', 'base', 'head', 'all'],
        uncommitted: ['files', 'untracked', 'base', 'head', 'all'],
        all: ['files', 'untracked', 'uncommitted', 'base', 'head']
    });
}
function withDepGraphOptions(yargs) {
    return yargs
        .describe('file', 'output file (e.g. --file=.vis/output.json)')
        .choices('output', [
        dep_graph_1.OutputType.json,
        dep_graph_1.OutputType.dot,
        dep_graph_1.OutputType.html,
        dep_graph_1.OutputType.svg
    ]);
}
function parseCSV(args) {
    return args.map(function (arg) { return arg.split(','); }).reduce(function (acc, value) {
        return acc.concat(value);
    }, []);
}
function withParallel(yargs) {
    return yargs
        .option('parallel', {
        describe: 'Parallelize the command',
        type: 'boolean',
        default: false
    })
        .option('maxParallel', {
        describe: 'Max number of parallel processes',
        type: 'number',
        default: 3
    });
}
