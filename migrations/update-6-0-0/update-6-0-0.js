"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
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
var literals_1 = require("@angular-devkit/core/src/utils/literals");
var tasks_1 = require("@angular-devkit/schematics/tasks");
var ast_utils_1 = require("../../src/utils/ast-utils");
var fileutils_1 = require("../../src/utils/fileutils");
var cli_config_utils_1 = require("../../src/utils/cli-config-utils");
var common_1 = require("../../src/utils/common");
var format_files_1 = require("../../src/utils/rules/format-files");
function createKarma(host, project) {
    var offset = common_1.offsetFromRoot(project.root);
    ast_utils_1.createOrUpdate(host, project.root + "/karma.conf.js", "\n// Karma configuration file, see link for more information\n// https://karma-runner.github.io/1.0/config/configuration-file.html\n\nmodule.exports = function (config) {\n  config.set({\n    basePath: '',\n    frameworks: ['jasmine', '@angular-devkit/build-angular'],\n    plugins: [\n      require('karma-jasmine'),\n      require('karma-chrome-launcher'),\n      require('karma-jasmine-html-reporter'),\n      require('karma-coverage-istanbul-reporter'),\n      require('@angular-devkit/build-angular/plugins/karma')\n    ],\n    client: {\n      clearContext: false // leave Jasmine Spec Runner output visible in browser\n    },\n    coverageIstanbulReporter: {\n      dir: require('path').join(__dirname, '" + offset + "coverage'),\n      reports: ['html', 'lcovonly'],\n      fixWebpackSourcePaths: true\n    },\n    reporters: ['progress', 'kjhtml'],\n    port: 9876,\n    colors: true,\n    logLevel: config.LOG_INFO,\n    autoWatch: true,\n    browsers: ['Chrome'],\n    singleRun: false\n  });\n};\n    ");
}
function createProtractor(host, project) {
    ast_utils_1.createOrUpdate(host, project.root + "/protractor.conf.js", "\n// Protractor configuration file, see link for more information\n// https://github.com/angular/protractor/blob/master/lib/config.ts\n\nconst { SpecReporter } = require('jasmine-spec-reporter');\n\nexports.config = {\n  allScriptsTimeout: 11000,\n  specs: [\n    './src/**/*.e2e-spec.ts'\n  ],\n  capabilities: {\n    'browserName': 'chrome'\n  },\n  directConnect: true,\n  baseUrl: 'http://localhost:4200/',\n  framework: 'jasmine',\n  jasmineNodeOpts: {\n    showColors: true,\n    defaultTimeoutInterval: 30000,\n    print: function() {}\n  },\n  onPrepare() {\n    require('ts-node').register({\n      project: require('path').join(__dirname, './tsconfig.e2e.json')\n    });\n    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));\n  }\n};\n    ");
}
function createTestTs(host, project) {
    if (project.projectType === 'library') {
        ast_utils_1.createOrUpdate(host, project.sourceRoot + "/test.ts", "\n// This file is required by karma.conf.js and loads recursively all the .spec and framework files\n\nimport 'core-js/es7/reflect';\nimport 'zone.js/dist/zone';\nimport 'zone.js/dist/zone-testing';\nimport { getTestBed } from '@angular/core/testing';\nimport {\n  BrowserDynamicTestingModule,\n  platformBrowserDynamicTesting\n} from '@angular/platform-browser-dynamic/testing';\n\ndeclare const require: any;\n\n// First, initialize the Angular testing environment.\ngetTestBed().initTestEnvironment(\n  BrowserDynamicTestingModule,\n  platformBrowserDynamicTesting()\n);\n// Then we find all the tests.\nconst context = require.context('./', true, /\\.spec\\.ts$/);\n// And load the modules.\ncontext.keys().map(context);    \n    ");
    }
    else {
        ast_utils_1.createOrUpdate(host, project.sourceRoot + "/test.ts", "\n// This file is required by karma.conf.js and loads recursively all the .spec and framework files\n\n  import 'zone.js/dist/zone-testing';\n  import { getTestBed } from '@angular/core/testing';\n  import {\n    BrowserDynamicTestingModule,\n    platformBrowserDynamicTesting\n  } from '@angular/platform-browser-dynamic/testing';\n\n  declare const require: any;\n\n// First, initialize the Angular testing environment.\n  getTestBed().initTestEnvironment(\n    BrowserDynamicTestingModule,\n    platformBrowserDynamicTesting()\n  );\n// Then we find all the tests.\n  const context = require.context('./', true, /.spec.ts$/);\n// And load the modules.\n  context.keys().map(context);\n    ");
    }
    return host;
}
function createBrowserlist(host, project) {
    ast_utils_1.createOrUpdate(host, project.root + "/browserslist", literals_1.stripIndents(templateObject_1 || (templateObject_1 = __makeTemplateObject(["\n      # This file is currently used by autoprefixer to adjust CSS to support the below specified browsers\n      # For additional information regarding the format and rule options, please see:\n      # https://github.com/browserslist/browserslist#queries\n      # For IE 9-11 support, please uncomment the last line of the file and adjust as needed\n      > 0.5%\n      last 2 versions\n      Firefox ESR\n      not dead\n      # IE 9-11\n    "], ["\n      # This file is currently used by autoprefixer to adjust CSS to support the below specified browsers\n      # For additional information regarding the format and rule options, please see:\n      # https://github.com/browserslist/browserslist#queries\n      # For IE 9-11 support, please uncomment the last line of the file and adjust as needed\n      > 0.5%\n      last 2 versions\n      Firefox ESR\n      not dead\n      # IE 9-11\n    "]))));
}
function createTsconfigSpecJson(host, project) {
    var files = ['src/test.ts'];
    var offset = common_1.offsetFromRoot(project.root);
    var compilerOptions = {
        outDir: offset + "dist/out-tsc/" + project.root,
        types: ['jasmine', 'node']
    };
    if (project.projectType === 'application') {
        files.push('src/polyfills.ts');
        compilerOptions['module'] = 'commonjs';
    }
    ast_utils_1.createOrUpdate(host, project.root + "/tsconfig.spec.json", fileutils_1.serializeJson({
        extends: offset + "tsconfig.json",
        compilerOptions: compilerOptions,
        files: files,
        include: ['**/*.spec.ts', '**/*.d.ts']
    }));
}
function createTslintJson(host, project) {
    var offset = common_1.offsetFromRoot(project.root);
    ast_utils_1.createOrUpdate(host, project.root + "/tslint.json", fileutils_1.serializeJson({
        extends: offset + "tslint.json",
        rules: {
            'directive-selector': [true, 'attribute', project.prefix, 'camelCase'],
            'component-selector': [true, 'element', project.prefix, 'kebab-case']
        }
    }));
}
function createTsconfigLibJson(host, project) {
    var offset = common_1.offsetFromRoot(project.root);
    ast_utils_1.createOrUpdate(host, project.root + "/tsconfig.lib.json", fileutils_1.serializeJson({
        extends: offset + "tsconfig.json",
        compilerOptions: {
            outDir: offset + "out-tsc/" + project.root,
            target: 'es2015',
            module: 'es2015',
            moduleResolution: 'node',
            declaration: true,
            sourceMap: true,
            inlineSources: true,
            emitDecoratorMetadata: true,
            experimentalDecorators: true,
            importHelpers: true,
            types: [],
            lib: ['dom', 'es2015']
        },
        angularCompilerOptions: {
            annotateForClosureCompiler: true,
            skipTemplateCodegen: true,
            strictMetadataEmit: true,
            fullTemplateTypeCheck: true,
            strictInjectionParameters: true,
            flatModuleId: 'AUTOGENERATED',
            flatModuleOutFile: 'AUTOGENERATED'
        },
        exclude: ['src/test.ts', '**/*.spec.ts']
    }));
}
function createAdditionalFiles(host) {
    var angularJson = ast_utils_1.readJsonInTree(host, 'angular.json');
    Object.entries(angularJson.projects).forEach(function (_a) {
        var key = _a[0], project = _a[1];
        if (project.architect.test) {
            createTsconfigSpecJson(host, project);
            createKarma(host, project);
            createTestTs(host, project);
        }
        if (project.projectType === 'application' && !project.architect.e2e) {
            createBrowserlist(host, project);
            createTslintJson(host, project);
        }
        if (project.projectType === 'application' && project.architect.e2e) {
            createProtractor(host, project);
        }
        if (project.projectType === 'library') {
            createTsconfigLibJson(host, project);
            createTslintJson(host, project);
        }
    });
    return host;
}
function moveE2eTests(host, context) {
    var angularJson = ast_utils_1.readJsonInTree(host, 'angular.json');
    Object.entries(angularJson.projects).forEach(function (_a) {
        var key = _a[0], p = _a[1];
        if (p.projectType === 'application' && !p.architect.e2e) {
            fileutils_1.renameSync(p.root + "/e2e", p.root + "-e2e/src", function (err) {
                if (!err) {
                    context.logger.info("Moved " + p.root + "/e2e to " + p.root + "-e2e/src");
                    return;
                }
                context.logger.info("We could not find e2e tests for the " + key + " project.");
                context.logger.info("Ignore this if there are no e2e tests for " + key + " project.");
                context.logger.warn(err.message);
                context.logger.warn("If there are e2e tests for the " + key + " project, we recommend manually moving them to " + p.root + "-e2e/src.");
            });
        }
    });
}
function deleteUnneededFiles(host) {
    try {
        host.delete('karma.conf.js');
        host.delete('protractor.conf.js');
        host.delete('tsconfig.spec.json');
        host.delete('test.js');
    }
    catch (e) { }
    return host;
}
function patchLibIndexFiles(host, context) {
    var angularJson = ast_utils_1.readJsonInTree(host, 'angular.json');
    Object.entries(angularJson.projects).forEach(function (_a) {
        var key = _a[0], p = _a[1];
        if (p.projectType === 'library') {
            try {
                // TODO: incorporate this into fileutils.renameSync
                fileutils_1.renameSync(p.sourceRoot, p.root + "/lib", function (err) {
                    if (err) {
                        context.logger.warn("We could not resolve the \"sourceRoot\" of the " + key + " library.");
                        throw err;
                    }
                    fileutils_1.renameSync(p.root + "/lib", p.sourceRoot + "/lib", function (err) {
                        // This should never error
                        context.logger.info("Moved " + p.sourceRoot + " to " + p.sourceRoot + "/lib");
                        context.logger.warn('Deep imports may have been affected. Always try to import from the index of the lib.');
                    });
                });
                var npmScope_1 = ast_utils_1.readJsonInTree(host, 'nx.json').npmScope;
                host = ast_utils_1.updateJsonInTree('tsconfig.json', function (json) {
                    json.compilerOptions.paths = json.compilerOptions.paths || {};
                    json.compilerOptions.paths["@" + npmScope_1 + "/" + p.root.replace('libs/', '')] = [p.sourceRoot + "/index.ts"];
                    return json;
                })(host, context);
                var content = host.read(p.root + "/index.ts").toString();
                host.create(p.sourceRoot + "/index.ts", content.replace(new RegExp('/src/', 'g'), '/lib/'));
                host.delete(p.root + "/index.ts");
            }
            catch (e) {
                context.logger.warn("Nx failed to successfully update '" + p.root + "'.");
                context.logger.warn("Error message: " + e.message);
                context.logger.warn("Please update the library manually.");
            }
        }
    });
    return host;
}
var ɵ0 = function (json) {
    json.dependencies = json.dependencies || {};
    json.devDependencies = json.devDependencies || {};
    json.scripts = __assign({}, json.scripts, { 'affected:test': './node_modules/.bin/nx affected:test' });
    json.dependencies = __assign({}, json.dependencies, { 
        // Migrating Angular Dependencies because ng update @angular/core doesn't work well right now
        '@angular/animations': '6.0.1', '@angular/common': '6.0.1', '@angular/compiler': '6.0.1', '@angular/core': '6.0.1', '@angular/forms': '6.0.1', '@angular/platform-browser': '6.0.1', '@angular/platform-browser-dynamic': '6.0.1', '@angular/router': '6.0.1', rxjs: '6.0.0', 'rxjs-compat': '6.0.0', 'zone.js': '^0.8.26', 'core-js': '^2.5.4', 
        // End Angular Versions
        '@ngrx/effects': '6.0.1', '@ngrx/router-store': '6.0.1', '@ngrx/store': '6.0.1', '@ngrx/store-devtools': '6.0.1', '@nrwl/nx': '6.0.2' });
    json.devDependencies = __assign({}, json.devDependencies, { 
        // Migrating Angular Dependencies because ng update @angular/core doesn't work well right now
        '@angular/compiler-cli': '6.0.1', '@angular/language-service': '6.0.1', 
        // End Angular Versions
        typescript: '2.7.2', 'jasmine-marbles': '0.3.1', '@types/jasmine': '~2.8.6', '@types/jasminewd2': '~2.0.3', '@types/node': '~8.9.4', codelyzer: '~4.2.1', 'jasmine-core': '~2.99.1', 'jasmine-spec-reporter': '~4.2.1', karma: '~2.0.0', 'karma-chrome-launcher': '~2.2.0', 'karma-coverage-istanbul-reporter': '~1.4.2', 'karma-jasmine': '~1.1.0', 'karma-jasmine-html-reporter': '^0.2.2', protractor: '~5.3.0', 'ts-node': '~5.0.1', tslint: '~5.9.1', prettier: '1.10.2' });
    if (json.dependencies['@angular/http']) {
        json.dependencies['@angular/http'] = '6.0.1';
    }
    if (json.dependencies['@angular/platform-server']) {
        json.dependencies['@angular/platform-server'] = '6.0.1';
    }
    if (json.dependencies['@angular/service-worker']) {
        json.dependencies['@angular/service-worker'] = '6.0.1';
    }
    if (json.dependencies['@angular/platform-webworker']) {
        json.dependencies['@angular/platform-webworker'] = '6.0.1';
    }
    if (json.dependencies['@angular/platform-webworker-dynamic']) {
        json.dependencies['@angular/platform-webworker-dynamic'] = '6.0.1';
    }
    if (json.dependencies['@angular/upgrade']) {
        json.dependencies['@angular/upgrade'] = '6.0.1';
    }
    return json;
};
exports.ɵ0 = ɵ0;
var updatePackageJson = ast_utils_1.updateJsonInTree('package.json', ɵ0);
function createDefaultAppTsConfig(host, project) {
    var offset = common_1.offsetFromRoot(project.root);
    var defaultAppTsConfig = {
        extends: offset + "tsconfig.json",
        compilerOptions: {
            outDir: offset + "dist/out-tsc/" + project.root,
            module: 'es2015'
        },
        include: ['**/*.ts'],
        exclude: ['src/test.ts', '**/*.spec.ts']
    };
    ast_utils_1.createOrUpdate(host, project.root + "/tsconfig.app.json", fileutils_1.serializeJson(defaultAppTsConfig));
}
function createDefaultE2eTsConfig(host, project) {
    var offset = common_1.offsetFromRoot(project.root);
    var defaultE2eTsConfig = {
        extends: offset + "tsconfig.json",
        compilerOptions: {
            outDir: offset + "dist/out-tsc/" + project.root,
            module: 'commonjs',
            target: 'es5',
            types: ['jasmine', 'jasminewd2', 'node']
        }
    };
    ast_utils_1.createOrUpdate(host, project.root + "/tsconfig.e2e.json", fileutils_1.serializeJson(defaultE2eTsConfig));
}
function updateTsConfigs(host) {
    var angularJson = ast_utils_1.readJsonInTree(host, 'angular.json');
    Object.entries(angularJson.projects).forEach(function (_a) {
        var key = _a[0], project = _a[1];
        if (project.architect.build &&
            project.architect.build.options.main.startsWith('apps')) {
            var offset = common_1.offsetFromRoot(project.root);
            var originalTsConfigPath = project.root + "/src/tsconfig.app.json";
            if (host.exists(originalTsConfigPath)) {
                var tsConfig = ast_utils_1.readJsonInTree(host, originalTsConfigPath);
                if (!tsConfig.exclude.includes('src/test.ts')) {
                    tsConfig.exclude.push('src/test.ts');
                }
                ast_utils_1.createOrUpdate(host, project.root + "/tsconfig.app.json", fileutils_1.serializeJson(__assign({}, tsConfig, { extends: offset + "tsconfig.json", compilerOptions: __assign({}, tsConfig.compilerOptions, { outDir: offset + "dist/out-tsc/" + project.root }), include: tsConfig.include.map(function (include) {
                        if (include.startsWith('../../../')) {
                            include = include.substring(3);
                        }
                        if (include.includes('/libs/') && include.endsWith('index.ts')) {
                            include = include.replace('index.ts', 'src/index.ts');
                        }
                        return include;
                    }) })));
                host.delete(project.root + "/src/tsconfig.app.json");
            }
            else {
                createDefaultAppTsConfig(host, project);
            }
        }
        if (project.architect.e2e) {
            var offset = common_1.offsetFromRoot(project.root);
            if (host.exists(project.root + "/src/tsconfig.e2e.json")) {
                var tsConfig = ast_utils_1.readJsonInTree(host, project.root + "/src/tsconfig.e2e.json");
                tsConfig.extends = offset + "tsconfig.json";
                tsConfig.compilerOptions = __assign({}, tsConfig.compilerOptions, { outDir: offset + "dist/out-tsc/" + project.root });
                delete tsConfig.include;
                delete tsConfig.exclude;
                ast_utils_1.createOrUpdate(host, project.root + "/tsconfig.e2e.json", fileutils_1.serializeJson(tsConfig));
                host.delete(project.root + "/src/tsconfig.e2e.json");
            }
            else {
                createDefaultE2eTsConfig(host, project);
            }
        }
    });
    return host;
}
var ɵ1 = function (json) {
    json.newProjectRoot = '';
    json.cli = __assign({}, json.cli, { defaultCollection: '@nrwl/schematics' });
    delete json.projects.$workspaceRoot;
    delete json.projects['$workspaceRoot-e2e'];
    var prefix = json.schematics['@nrwl/schematics:component'].prefix;
    delete json.schematics;
    json.defaultProject = pathToName(json.defaultProject);
    var projects = {};
    Object.entries(json.projects).forEach(function (_a) {
        var key = _a[0], project = _a[1];
        var type = !project.architect.build
            ? 'e2e'
            : project.architect.build.options.main.startsWith('apps')
                ? 'application'
                : 'library';
        if (type !== 'e2e') {
            project.projectType = type;
        }
        switch (type) {
            case 'application':
                project.prefix = prefix;
                project.architect.build.options.tsConfig = project.root + "/tsconfig.app.json";
                project.architect.test.options.karmaConfig = project.root + "/karma.conf.js";
                project.architect.test.options.tsConfig = project.root + "/tsconfig.spec.json";
                project.architect.test.options.main = project.sourceRoot + "/test.ts";
                project.architect.lint.options.tsConfig = [
                    project.root + "/tsconfig.app.json",
                    project.root + "/tsconfig.spec.json"
                ];
                project.architect.serve.options.browserTarget = cli_config_utils_1.serializeTarget(parseAndNormalizeTarget(project.architect.serve.options.browserTarget));
                project.architect.serve.configurations.production.browserTarget = cli_config_utils_1.serializeTarget(parseAndNormalizeTarget(project.architect.serve.configurations.production.browserTarget));
                project.architect['extract-i18n'].options.browserTarget = cli_config_utils_1.serializeTarget(parseAndNormalizeTarget(project.architect['extract-i18n'].options.browserTarget));
                projects[pathToName(key)] = project;
                break;
            case 'library':
                project.prefix = prefix;
                project.projectType = 'library';
                project.architect.test.options.karmaConfig = project.root + "/karma.conf.js";
                project.architect.test.options.tsConfig = project.root + "/tsconfig.spec.json";
                project.architect.test.options.main = project.sourceRoot + "/test.ts";
                project.architect.lint.options.tsConfig = [
                    project.root + "/tsconfig.lib.json",
                    project.root + "/tsconfig.spec.json"
                ];
                delete project.architect.build;
                delete project.architect.serve;
                delete project.architect['extract-i18n'];
                projects[pathToName(key)] = project;
                break;
            case 'e2e':
                var appProjectKey = cli_config_utils_1.parseTarget(project.architect.e2e.options.devServerTarget).project;
                var appProject = json.projects[appProjectKey];
                if (appProject.projectType === 'library') {
                    break;
                }
                project.root = appProject.root + "-e2e";
                project.sourceRoot = project.root + "/src";
                project.prefix = prefix;
                project.architect.e2e.options.protractorConfig = project.root + "/protractor.conf.js";
                project.architect.lint.options.tsConfig = [
                    project.root + "/tsconfig.e2e.json"
                ];
                project.architect.e2e.options.devServerTarget = cli_config_utils_1.serializeTarget(parseAndNormalizeTarget(project.architect.e2e.options.devServerTarget));
                projects[pathToName(key)] = project;
                break;
        }
    });
    json.projects = projects;
    return json;
};
exports.ɵ1 = ɵ1;
var updateAngularJson = ast_utils_1.updateJsonInTree('angular.json', ɵ1);
function addInstallTask(host, context) {
    context.addTask(new tasks_1.NodePackageInstallTask());
}
function checkCli6Upgraded(host) {
    if (!host.exists('angular.json') && host.exists('.angular-cli.json')) {
        throw new Error('Please install the latest version and run ng update @angular/cli first');
    }
}
function parseAndNormalizeTarget(s) {
    var r = cli_config_utils_1.parseTarget(s);
    return __assign({}, r, { project: pathToName(r.project) });
}
function pathToName(s) {
    return s.replace(new RegExp('/', 'g'), '-');
}
function default_1() {
    return schematics_1.chain([
        checkCli6Upgraded,
        updatePackageJson,
        updateAngularJson,
        moveE2eTests,
        updateTsConfigs,
        createAdditionalFiles,
        deleteUnneededFiles,
        patchLibIndexFiles,
        addInstallTask,
        format_files_1.formatFiles()
    ]);
}
exports.default = default_1;
var templateObject_1;
