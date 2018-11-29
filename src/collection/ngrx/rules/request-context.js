"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var stringUtils = require("../../../utils/strings");
function buildNameToNgrxFile(context, suffice) {
    return path.join(context.moduleDir, context.options.directory, stringUtils.dasherize(context.featureName) + "." + suffice);
}
exports.buildNameToNgrxFile = buildNameToNgrxFile;
