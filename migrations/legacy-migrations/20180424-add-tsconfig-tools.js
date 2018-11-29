"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var path = require("path");
exports.default = {
    description: 'Add tsconfig.tools.json',
    run: function () {
        fs_1.writeFileSync(path.join('tools', 'tsconfig.tools.json'), JSON.stringify({
            extends: '../tsconfig.json',
            compilerOptions: {
                outDir: '../dist/out-tsc/tools',
                rootDir: '.',
                module: 'commonjs',
                target: 'es5',
                types: ['jasmine', 'node']
            },
            include: ['**/*.ts']
        }, null, 2));
    }
};
