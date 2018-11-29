"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * This is temporarily copied from `@angular/cli` with a performance fix.
 * Remove when this PR ships: https://github.com/angular/angular-cli/pull/12857
 */
var core_1 = require("@angular-devkit/core");
var schematics_1 = require("@angular-devkit/schematics");
function move(from, to) {
    if (to === undefined) {
        to = from;
        from = '/';
    }
    var fromPath = core_1.normalize('/' + from);
    var toPath = core_1.normalize('/' + to);
    if (fromPath === toPath) {
        return schematics_1.noop();
    }
    return function (tree) {
        if (tree.exists(fromPath)) {
            // fromPath is a file
            tree.rename(fromPath, toPath);
        }
        else {
            // fromPath is a directory
            tree.getDir(fromPath).visit(function (path) {
                tree.rename(path, toPath + '/' + path.substr(fromPath.length));
            });
        }
        return tree;
    };
}
exports.move = move;
