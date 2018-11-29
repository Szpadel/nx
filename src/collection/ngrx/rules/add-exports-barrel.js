"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
var path = require("path");
var name_utils_1 = require("../../../utils/name-utils");
var ast_utils_1 = require("../../../utils/ast-utils");
/**
 * Add ngrx feature exports to the public barrel in the feature library
 */
function addExportsToBarrel(options) {
    return function (host) {
        if (!host.exists(options.module)) {
            throw new Error("Specified module path (" + options.module + ") does not exist");
        }
        // Only update the public barrel for feature libraries
        if (options.root != true) {
            var moduleDir = path.dirname(options.module);
            var indexFilePath = path.join(moduleDir, '../index.ts');
            var hasFacade = options.facade == true;
            var buffer = host.read(indexFilePath);
            if (!!buffer) {
                // AST to 'index.ts' barrel for the public API
                var indexSource = buffer.toString('utf-8');
                var indexSourceFile = ts.createSourceFile(indexFilePath, indexSource, ts.ScriptTarget.Latest, true);
                // Public API for the feature interfaces, selectors, and facade
                var fileName = name_utils_1.names(options.name).fileName;
                var statePath = "./lib/" + options.directory + "/" + fileName;
                ast_utils_1.insert(host, indexFilePath, (hasFacade
                    ? ast_utils_1.addGlobal(indexSourceFile, indexFilePath, "export * from '" + statePath + ".facade';")
                    : []).concat(ast_utils_1.addGlobal(indexSourceFile, indexFilePath, "export * from '" + statePath + ".reducer';"), ast_utils_1.addGlobal(indexSourceFile, indexFilePath, "export * from '" + statePath + ".selectors';")));
            }
        }
        return host;
    };
}
exports.addExportsToBarrel = addExportsToBarrel;
