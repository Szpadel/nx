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
var fileutils_1 = require("../../src/utils/fileutils");
exports.default = {
    description: 'Add @angular-devkit/core as a dev dependency',
    run: function () {
        fileutils_1.updateJsonFile('package.json', function (json) {
            var _a;
            json.devDependencies = __assign({}, json.devDependencies, (_a = {}, _a['@angular-devkit/core'] = '^0.0.29', _a));
        });
    }
};
