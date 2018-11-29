"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var fileutils_1 = require("../../src/utils/fileutils");
var literals_1 = require("@angular-devkit/core/src/utils/literals");
var child_process_1 = require("child_process");
var path_1 = require("path");
exports.default = {
    description: "Switch to Nx 6.0",
    run: function () {
        if (!fs_1.existsSync('.angular-cli.json') && fs_1.existsSync('angular.json')) {
            console.warn(literals_1.stripIndents(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n        You have already upgraded to Angular CLI 6.\n        We will not be able to recover information about your project's tags for you.\n      "], ["\n        You have already upgraded to Angular CLI 6.\n        We will not be able to recover information about your project's tags for you.\n      "]))));
            return;
        }
        fileutils_1.updateJsonFile('package.json', function (json) {
            json.devDependencies['@angular/cli'] = '6.1.2';
        });
        fileutils_1.updateJsonFile('package.json', function (json) {
            delete json.scripts.postinstall;
        });
        try {
            if (fs_1.existsSync('yarn.lock')) {
                child_process_1.execSync('yarn install', { stdio: [0, 1, 2] });
            }
            else {
                child_process_1.execSync('npm install', { stdio: [0, 1, 2] });
            }
            child_process_1.execSync('ng update @angular/cli --from 1.7.4 --to 6.0.1 --migrate-only', {
                stdio: [0, 1, 2]
            });
            var currentVersion = fileutils_1.readJsonFile(path_1.join(__dirname, '../../package.json'))
                .version;
            child_process_1.execSync("ng generate @schematics/update:migrate --package @nrwl/schematics --collection @nrwl/schematics/migrations/migrations.json --from 1.0.3 --to " + currentVersion, {
                stdio: [0, 1, 2]
            });
        }
        catch (e) {
            console.warn(literals_1.stripIndents(templateObject_2 || (templateObject_2 = __makeTemplateObject(["\n        The automatic upgrade to Nx 6 has failed with the following error: ", ".\n        \n        You can upgrade it manually by running:\n        \n        * yarn install or npm install\n        * ng update @angular/cli@6.0.1\n        * ng update @nrwl/schematics@6.0.0\n        \n        The upgrade process creates a test target for every library. If you have a library\n        that does not have specs, either set failOnEmptyTestSuite to false in karma.conf.js of the library, \n        or remove the test target in angular.json.\n      "], ["\n        The automatic upgrade to Nx 6 has failed with the following error: ", ".\n        \n        You can upgrade it manually by running:\n        \n        * yarn install or npm install\n        * ng update @angular/cli@6.0.1\n        * ng update @nrwl/schematics@6.0.0\n        \n        The upgrade process creates a test target for every library. If you have a library\n        that does not have specs, either set failOnEmptyTestSuite to false in karma.conf.js of the library, \n        or remove the test target in angular.json.\n      "])), e));
            throw e;
        }
        console.log(literals_1.stripIndents(templateObject_3 || (templateObject_3 = __makeTemplateObject(["\n        The upgrade process creates a test target for every library. If you have a library\n        that does not have specs, either set failOnEmptyTestSuite to false in karma.conf.js of the library, \n        or remove the test target in angular.json.\n    "], ["\n        The upgrade process creates a test target for every library. If you have a library\n        that does not have specs, either set failOnEmptyTestSuite to false in karma.conf.js of the library, \n        or remove the test target in angular.json.\n    "]))));
    }
};
var templateObject_1, templateObject_2, templateObject_3;
