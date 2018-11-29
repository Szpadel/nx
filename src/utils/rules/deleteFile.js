"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var schematics_1 = require("@angular-devkit/schematics");
/**
 * Remove a file from the Virtual Schematic Tree
 */
function deleteFile(from) {
    return schematics_1.forEach(function (entry) {
        return entry.path === from ? null : entry;
    });
}
exports.deleteFile = deleteFile;
