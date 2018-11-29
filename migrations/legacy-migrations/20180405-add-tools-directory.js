"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path = require("path");
exports.default = {
    description: 'Add tools directory',
    run: function () {
        try {
            fs_1.mkdirSync('tools');
        }
        catch (e) { }
        try {
            fs_1.mkdirSync(path.join('tools', 'schematics'));
        }
        catch (e) { }
        fs_1.writeFileSync(path.join('tools', 'schematics', '.gitkeep'), '');
    }
};
