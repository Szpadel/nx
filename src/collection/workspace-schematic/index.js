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
var schematics_1 = require("@angular-devkit/schematics");
var name_utils_1 = require("../../utils/name-utils");
var format_files_1 = require("../../utils/rules/format-files");
function default_1(schema) {
    var options = normalizeOptions(schema);
    var templateSource = schematics_1.apply(schematics_1.url('./files'), [
        schematics_1.template(__assign({ dot: '.', tmpl: '' }, options)),
        schematics_1.move('tools/schematics')
    ]);
    return schematics_1.chain([
        schematics_1.branchAndMerge(schematics_1.chain([schematics_1.mergeWith(templateSource)])),
        format_files_1.formatFiles(options)
    ]);
}
exports.default = default_1;
function normalizeOptions(options) {
    var name = name_utils_1.toFileName(options.name);
    return __assign({}, options, { name: name });
}
