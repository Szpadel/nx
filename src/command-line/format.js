"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var path = require("path");
var resolve = require("resolve");
var shared_1 = require("./shared");
var PRETTIER_EXTENSIONS = ['ts', 'js', 'scss', 'css', 'html', 'json', 'md'];
function format(command, args) {
    var patterns;
    try {
        patterns = getPatterns(args);
    }
    catch (e) {
        printError(command, e);
        process.exit(1);
    }
    // Chunkify the patterns array to prevent crashing the windows terminal
    var chunkList = chunkify(patterns, 70);
    switch (command) {
        case 'write':
            chunkList.forEach(function (chunk) { return write(chunk); });
            break;
        case 'check':
            chunkList.forEach(function (chunk) { return check(chunk); });
            break;
    }
}
exports.format = format;
function getPatterns(args) {
    try {
        if (args.all) {
            return getPatternsWithPathPrefix(['{apps,libs,tools}']);
        }
        var p = shared_1.parseFiles(args);
        var patterns = p.files.filter(function (f) {
            return PRETTIER_EXTENSIONS.map(function (ext) { return '.' + ext; }).includes(path.extname(f));
        });
        var libsAndApp = args.libsAndApps;
        return libsAndApp ? getPatternsFromApps(patterns) : patterns;
    }
    catch (e) {
        return getPatternsWithPathPrefix(['{apps,libs,tools}']);
    }
}
function getPatternsFromApps(affectedFiles) {
    var roots = shared_1.getProjectRoots(shared_1.getTouchedProjects(affectedFiles));
    return getPatternsWithPathPrefix(roots);
}
function chunkify(target, size) {
    return target.reduce(function (current, value, index) {
        if (index % size === 0)
            current.push([]);
        current[current.length - 1].push(value);
        return current;
    }, []);
}
function getPatternsWithPathPrefix(prefixes) {
    return prefixes.map(function (prefix) { return "\"" + prefix + "/**/*.{" + PRETTIER_EXTENSIONS.join(',') + "}\""; });
}
function printError(command, e) {
    console.error("Pass the SHA range, as follows: npm run format:" + command + " -- SHA1 SHA2.");
    console.error("Or pass the list of files, as follows: npm run format:" + command + " -- --files=\"libs/mylib/index.ts,libs/mylib2/index.ts\".");
    console.error(e.message);
}
function write(patterns) {
    if (patterns.length > 0) {
        child_process_1.execSync("node \"" + prettierPath() + "\" --write " + patterns.join(' '), {
            stdio: [0, 1, 2]
        });
    }
}
function check(patterns) {
    if (patterns.length > 0) {
        try {
            child_process_1.execSync("node \"" + prettierPath() + "\" --list-different " + patterns.join(' '), {
                stdio: [0, 1, 2]
            });
        }
        catch (e) {
            process.exit(1);
        }
    }
}
function prettierPath() {
    var basePath = path.dirname(resolve.sync('prettier', { basedir: __dirname }));
    return path.join(basePath, 'bin-prettier.js');
}
