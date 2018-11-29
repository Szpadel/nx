"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular-devkit/schematics/testing");
var schematics_1 = require("@angular-devkit/schematics");
var path = require("path");
var update_karma_conf_1 = require("./update-karma-conf");
var testing_utils_1 = require("../testing-utils");
var ast_utils_1 = require("../ast-utils");
describe('updateKarmaConf', function () {
    var tree;
    var schematicRunner;
    beforeEach(function (done) {
        schematicRunner = new testing_1.SchematicTestRunner('@nrwl/schematics', path.join(__dirname, '../../collection.json'));
        tree = testing_utils_1.createEmptyWorkspace(schematics_1.Tree.empty());
        tree.create('apps/projectName/karma.conf.js', '');
        var process$ = schematicRunner.callRule(ast_utils_1.updateJsonInTree('/angular.json', function (angularJson) {
            angularJson.projects.projectName = {
                root: 'apps/projectName',
                architect: {
                    test: {
                        options: {
                            karmaConfig: 'apps/projectName/karma.conf.js'
                        }
                    }
                }
            };
            return angularJson;
        }), tree);
        process$.subscribe(function (_) { return done(); }, function (error) {
            console.log(error);
        });
    });
    it('should overwrite the karma.conf.js', function (done) {
        var replaceKarmaConf = update_karma_conf_1.updateKarmaConf({ projectName: 'projectName' });
        schematicRunner.callRule(replaceKarmaConf, tree).subscribe(function (result) {
            var contents = result.read('apps/projectName/karma.conf.js');
            expect(contents.toString()).toEqual(UPDATED_KARMA_CONF);
            done();
        });
    });
});
var UPDATED_KARMA_CONF = "// Karma configuration file, see link for more information\n// https://karma-runner.github.io/1.0/config/configuration-file.html\n\nconst { join } = require('path');\nconst getBaseKarmaConfig = require('../../karma.conf');\n\nmodule.exports = function(config) {\n  const baseConfig = getBaseKarmaConfig();\n  config.set({\n    ...baseConfig,\n    coverageIstanbulReporter: {\n      ...baseConfig.coverageIstanbulReporter,\n      dir: join(__dirname, '../../coverage/apps/projectName')\n    }\n  });\n};\n";
