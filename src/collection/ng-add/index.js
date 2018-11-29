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
var path = require("path");
var path_1 = require("path");
var lib_versions_1 = require("../../lib-versions");
var fs = require("fs");
var ts = require("typescript");
var common_1 = require("../../utils/common");
var fileutils_1 = require("../../utils/fileutils");
var name_utils_1 = require("../../utils/name-utils");
var ast_utils_1 = require("../../utils/ast-utils");
var cli_config_utils_1 = require("../../utils/cli-config-utils");
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var tasks_1 = require("@angular-devkit/schematics/tasks");
var ng_ast_utils_1 = require("@schematics/angular/utility/ng-ast-utils");
var ast_utils_2 = require("@schematics/angular/utility/ast-utils");
function updatePackageJson() {
    return ast_utils_1.updateJsonInTree('package.json', function (packageJson) {
        packageJson.scripts = packageJson.scripts || {};
        packageJson.scripts = __assign({}, packageJson.scripts, { 'affected:apps': './node_modules/.bin/nx affected:apps', 'affected:libs': './node_modules/.bin/nx affected:libs', 'affected:build': './node_modules/.bin/nx affected:build', 'affected:e2e': './node_modules/.bin/nx affected:e2e', 'affected:test': './node_modules/.bin/nx affected:test', 'affected:lint': './node_modules/.bin/nx affected:lint', 'affected:dep-graph': './node_modules/.bin/nx affected:dep-graph', affected: './node_modules/.bin/nx affected', format: './node_modules/.bin/nx format:write', 'format:write': './node_modules/.bin/nx format:write', 'format:check': './node_modules/.bin/nx format:check', update: 'ng update @nrwl/schematics', 'update:check': 'ng update', lint: './node_modules/.bin/nx lint && ng lint', 'dep-graph': './node_modules/.bin/nx dep-graph', 'workspace-schematic': './node_modules/.bin/nx workspace-schematic', help: './node_modules/.bin/nx help' });
        packageJson.devDependencies = packageJson.devDependencies || {};
        if (!packageJson.dependencies) {
            packageJson.dependencies = {};
        }
        if (!packageJson.dependencies['@nrwl/nx']) {
            packageJson.dependencies['@nrwl/nx'] = lib_versions_1.nxVersion;
        }
        if (!packageJson.dependencies['@ngrx/store']) {
            packageJson.dependencies['@ngrx/store'] = lib_versions_1.ngrxVersion;
        }
        if (!packageJson.dependencies['@ngrx/router-store']) {
            packageJson.dependencies['@ngrx/router-store'] = lib_versions_1.ngrxVersion;
        }
        if (!packageJson.dependencies['@ngrx/effects']) {
            packageJson.dependencies['@ngrx/effects'] = lib_versions_1.ngrxVersion;
        }
        if (!packageJson.devDependencies['@ngrx/store-devtools']) {
            packageJson.devDependencies['@ngrx/store-devtools'] = lib_versions_1.ngrxVersion;
        }
        if (!packageJson.devDependencies['ngrx-store-freeze']) {
            packageJson.devDependencies['ngrx-store-freeze'] = lib_versions_1.ngrxStoreFreezeVersion;
        }
        if (packageJson.dependencies['@nrwl/schematics']) {
            delete packageJson.dependencies['@nrwl/schematics'];
        }
        if (!packageJson.devDependencies['@nrwl/schematics']) {
            packageJson.devDependencies['@nrwl/schematics'] = lib_versions_1.schematicsVersion;
        }
        if (!packageJson.devDependencies['@angular/cli']) {
            packageJson.devDependencies['@angular/cli'] = lib_versions_1.angularCliVersion;
        }
        packageJson.devDependencies['karma'] = '~2.0.0';
        if (!packageJson.devDependencies['jasmine-marbles']) {
            packageJson.devDependencies['jasmine-marbles'] = lib_versions_1.jasmineMarblesVersion;
        }
        if (!packageJson.devDependencies['prettier']) {
            packageJson.devDependencies['prettier'] = lib_versions_1.prettierVersion;
        }
        return packageJson;
    });
}
function convertPath(name, originalPath) {
    return "apps/" + name + "/" + originalPath;
}
function updateAngularCLIJson(options) {
    return ast_utils_1.updateJsonInTree('angular.json', function (angularJson) {
        angularJson = __assign({}, angularJson, { newProjectRoot: '', cli: {
                defaultCollection: '@nrwl/schematics'
            } });
        var app = angularJson.projects[options.name];
        var e2eProject = getE2eProject(angularJson);
        var oldSourceRoot = app.sourceRoot;
        function convertAsset(asset) {
            if (typeof asset === 'string') {
                return asset.startsWith(oldSourceRoot)
                    ? convertPath(options.name, asset)
                    : asset;
            }
            else {
                return __assign({}, asset, { input: asset.input && asset.input.startsWith(oldSourceRoot)
                        ? convertPath(options.name, asset.input)
                        : asset.input });
            }
        }
        app = __assign({}, app, { root: path.join('apps', options.name), sourceRoot: convertPath(options.name, app.sourceRoot) });
        var buildConfig = app.architect.build;
        buildConfig.options = __assign({}, buildConfig.options, { outputPath: path.join('dist/apps', options.name), index: convertPath(options.name, buildConfig.options.index), main: convertPath(options.name, buildConfig.options.main), tsConfig: path.join(app.root, getFilename(buildConfig.options.tsConfig)), polyfills: buildConfig.options.polyfills &&
                convertPath(options.name, buildConfig.options.polyfills), assets: buildConfig.options.assets &&
                buildConfig.options.assets.map(convertAsset), styles: buildConfig.options.styles &&
                buildConfig.options.styles.map(convertAsset), scripts: buildConfig.options.scripts &&
                buildConfig.options.scripts.map(convertAsset) });
        Object.keys(buildConfig.configurations)
            .filter(function (configurationName) {
            return buildConfig.configurations[configurationName].fileReplacements;
        })
            .forEach(function (configurationName) {
            buildConfig.configurations[configurationName].fileReplacements = buildConfig.configurations[configurationName].fileReplacements.map(function (replacement) {
                return {
                    replace: convertPath(options.name, replacement.replace),
                    with: convertPath(options.name, replacement.with)
                };
            });
        });
        var serveConfig = app.architect.serve;
        serveConfig.options.browserTarget = cli_config_utils_1.editTarget(serveConfig.options.browserTarget, function (parsedTarget) {
            return __assign({}, parsedTarget, { project: options.name });
        });
        serveConfig.configurations.production.browserTarget = cli_config_utils_1.editTarget(serveConfig.configurations.production.browserTarget, function (parsedTarget) {
            return __assign({}, parsedTarget, { project: options.name });
        });
        var i18nConfig = app.architect['extract-i18n'];
        i18nConfig.options.browserTarget = cli_config_utils_1.editTarget(i18nConfig.options.browserTarget, function (parsedTarget) {
            return __assign({}, parsedTarget, { project: options.name });
        });
        var testConfig = app.architect.test;
        testConfig.options = __assign({}, testConfig.options, { main: convertPath(options.name, testConfig.options.main), tsConfig: path.join(app.root, getFilename(testConfig.options.tsConfig)), karmaConfig: path.join(app.root, getFilename(testConfig.options.karmaConfig)), polyfills: testConfig.options.polyfills &&
                convertPath(options.name, testConfig.options.polyfills), assets: testConfig.options.assets &&
                testConfig.options.assets.map(convertAsset), styles: testConfig.options.styles &&
                testConfig.options.styles.map(convertAsset), scripts: testConfig.options.scripts &&
                testConfig.options.scripts.map(convertAsset) });
        var lintConfig = app.architect.lint;
        lintConfig.options = __assign({}, lintConfig.options, { tsConfig: [buildConfig.options.tsConfig, testConfig.options.tsConfig] });
        if (app.architect.server) {
            var serverConfig = app.architect.server;
            serverConfig.options = __assign({}, serverConfig.options, { outputPath: path.join('dist/apps', options.name + '-server'), main: convertPath(options.name, serverConfig.options.main), tsConfig: path.join(app.root, getFilename(serverConfig.options.tsConfig)) });
        }
        angularJson.projects[options.name] = app;
        if (e2eProject) {
            e2eProject.root = path.join('apps', getE2eKey(angularJson));
            var e2eConfig = e2eProject.architect.e2e;
            e2eConfig.options = __assign({}, e2eConfig.options, { protractorConfig: path.join(e2eProject.root, getFilename(e2eConfig.options.protractorConfig)) });
            e2eConfig.options.devServerTarget = cli_config_utils_1.editTarget(e2eConfig.options.devServerTarget, function (parsedTarget) {
                return __assign({}, parsedTarget, { project: options.name });
            });
            var e2eLintConfig = e2eProject.architect.lint;
            e2eLintConfig.options.tsConfig = Array.isArray(e2eLintConfig.options.tsConfig)
                ? e2eLintConfig.options.tsConfig.map(function (tsConfigPath) {
                    return path.join(e2eProject.root, getFilename(tsConfigPath));
                })
                : path.join(e2eProject.root, getFilename(e2eLintConfig.options.tsConfig));
            angularJson.projects[getE2eKey(angularJson)] = e2eProject;
        }
        return angularJson;
    });
}
function updateTsConfig(options) {
    return ast_utils_1.updateJsonInTree('tsconfig.json', function (tsConfigJson) {
        return setUpCompilerOptions(tsConfigJson, options.npmScope, '');
    });
}
function parseLoadChildren(loadChildrenString) {
    var _a = loadChildrenString.split('#'), path = _a[0], className = _a[1];
    return {
        path: path,
        className: className
    };
}
function serializeLoadChildren(_a) {
    var path = _a.path, className = _a.className;
    return path + "#" + className;
}
function updateTsConfigsJson(options) {
    return function (host) {
        var angularJson = ast_utils_1.readJsonInTree(host, 'angular.json');
        var app = angularJson.projects[options.name];
        var e2eProject = getE2eProject(angularJson);
        // This has to stay using fs since it is created with fs
        var offset = '../../';
        fileutils_1.updateJsonFile(app.root + "/tsconfig.app.json", function (json) {
            json.extends = offset + "tsconfig.json";
            json.compilerOptions.outDir = offset + "dist/out-tsc/apps/" + options.name;
        });
        // This has to stay using fs since it is created with fs
        fileutils_1.updateJsonFile(app.root + "/tsconfig.spec.json", function (json) {
            json.extends = offset + "tsconfig.json";
            json.compilerOptions.outDir = offset + "dist/out-tsc/apps/" + options.name;
            if (json.files) {
                json.files = json.files.map(function (file) {
                    return path.join(path.relative(app.root, app.sourceRoot), file);
                });
            }
        });
        if (app.architect.server) {
            fileutils_1.updateJsonFile(app.root + "/tsconfig.server.json", function (json) {
                json.compilerOptions.outDir = offset + "dist/out-tsc/apps/" + options.name + "-server";
                var loadChildrenConfig = parseLoadChildren(json.angularCompilerOptions.entryModule);
                loadChildrenConfig.path = path.join('src', loadChildrenConfig.path);
                json.angularCompilerOptions = __assign({}, json.angularCompilerOptions, { entryModule: serializeLoadChildren(loadChildrenConfig) });
            });
        }
        if (e2eProject) {
            // This has to stay using fs since it is created with fs
            fileutils_1.updateJsonFile(e2eProject.root + "/tsconfig.e2e.json", function (json) {
                json.extends = common_1.offsetFromRoot(e2eProject.root) + "tsconfig.json";
                json.compilerOptions = __assign({}, json.compilerOptions, { outDir: common_1.offsetFromRoot(e2eProject.root) + "dist/out-tsc/" + e2eProject.root });
            });
        }
        return host;
    };
}
function updateTsLint() {
    return ast_utils_1.updateJsonInTree('tslint.json', function (tslintJson) {
        [
            'no-trailing-whitespace',
            'one-line',
            'quotemark',
            'typedef-whitespace',
            'whitespace'
        ].forEach(function (key) {
            tslintJson[key] = undefined;
        });
        tslintJson.rulesDirectory = tslintJson.rulesDirectory || [];
        tslintJson.rulesDirectory.push('node_modules/@nrwl/schematics/src/tslint');
        tslintJson.rules['nx-enforce-module-boundaries'] = [
            true,
            {
                allow: [],
                depConstraints: [{ sourceTag: '*', onlyDependOnLibsWithTags: ['*'] }]
            }
        ];
        return tslintJson;
    });
}
function updateProjectTsLint(options) {
    return function (host) {
        var angularJson = ast_utils_1.readJsonInTree(host, '/angular.json');
        var app = angularJson.projects[options.name];
        var offset = '../../';
        if (host.exists(app.root + "/tslint.json")) {
            fileutils_1.updateJsonFile(app.root + "/tslint.json", function (json) {
                json.extends = offset + "tslint.json";
            });
        }
        return host;
    };
}
function setUpCompilerOptions(tsconfig, npmScope, offset) {
    if (!tsconfig.compilerOptions.paths) {
        tsconfig.compilerOptions.paths = {};
    }
    tsconfig.compilerOptions.baseUrl = '.';
    tsconfig.compilerOptions.paths["@" + npmScope + "/*"] = [offset + "libs/*"];
    return tsconfig;
}
function moveOutOfSrc(sourceRoot, appName, filename, context) {
    var from = path.join(sourceRoot, filename);
    var to = path.join('apps', appName, filename);
    fileutils_1.renameSync(from, to, function (err) {
        if (!context) {
            return;
        }
        else if (!err) {
            context.logger.info("Renamed " + from + " -> " + to);
        }
        else {
            context.logger.warn(err.message);
        }
    });
}
function getFilename(path) {
    return path.split('/').pop();
}
function getE2eKey(angularJson) {
    return Object.keys(angularJson.projects).find(function (key) {
        return !!angularJson.projects[key].architect.e2e;
    });
}
function getE2eProject(angularJson) {
    var key = getE2eKey(angularJson);
    if (key) {
        return angularJson.projects[key];
    }
    else {
        return null;
    }
}
function moveExistingFiles(options) {
    return function (host, context) {
        var angularJson = ast_utils_1.readJsonInTree(host, 'angular.json');
        var app = angularJson.projects[options.name];
        var e2eApp = getE2eProject(angularJson);
        // No context is passed because it should not be required to have a browserslist
        moveOutOfSrc(app.sourceRoot, options.name, 'browserslist');
        moveOutOfSrc(app.sourceRoot, options.name, getFilename(app.architect.test.options.karmaConfig), context);
        moveOutOfSrc(app.sourceRoot, options.name, getFilename(app.architect.build.options.tsConfig), context);
        moveOutOfSrc(app.sourceRoot, options.name, getFilename(app.architect.test.options.tsConfig), context);
        if (app.architect.server) {
            moveOutOfSrc(app.sourceRoot, options.name, getFilename(app.architect.server.options.tsConfig), context);
        }
        moveOutOfSrc(app.sourceRoot, options.name, 'tslint.json', context);
        var oldAppSourceRoot = app.sourceRoot;
        var newAppSourceRoot = path_1.join('apps', options.name, app.sourceRoot);
        fileutils_1.renameSync(oldAppSourceRoot, newAppSourceRoot, function (err) {
            if (!err) {
                context.logger.info("Renamed " + oldAppSourceRoot + " -> " + newAppSourceRoot);
            }
            else {
                context.logger.error(err.message);
                throw err;
            }
        });
        if (e2eApp) {
            var oldE2eRoot_1 = e2eApp.root;
            var newE2eRoot_1 = path_1.join('apps', getE2eKey(angularJson));
            fileutils_1.renameSync(oldE2eRoot_1, newE2eRoot_1, function (err) {
                if (!err) {
                    context.logger.info("Renamed " + oldE2eRoot_1 + " -> " + newE2eRoot_1);
                }
                else {
                    context.logger.error(err.message);
                    throw err;
                }
            });
        }
        else {
            context.logger.warn('No e2e project was migrated because there was none declared in angular.json');
        }
        return host;
    };
}
function createAdditionalFiles(options) {
    return function (host, _context) {
        var _a;
        var angularJson = ast_utils_1.readJsonInTree(host, 'angular.json');
        host.create('nx.json', fileutils_1.serializeJson({
            npmScope: options.npmScope,
            implicitDependencies: {
                'angular.json': '*',
                'package.json': '*',
                'tsconfig.json': '*',
                'tslint.json': '*',
                'nx.json': '*'
            },
            projects: (_a = {},
                _a[options.name] = {
                    tags: []
                },
                _a[getE2eKey(angularJson)] = {
                    tags: []
                },
                _a)
        }));
        host.create('libs/.gitkeep', '');
        // if the user does not already have a prettier configuration
        // of any kind, create one
        return rxjs_1.from(common_1.resolveUserExistingPrettierConfig()).pipe(operators_1.tap(function (existingPrettierConfig) {
            if (!existingPrettierConfig) {
                host.create('.prettierrc', fileutils_1.serializeJson(common_1.DEFAULT_NRWL_PRETTIER_CONFIG));
            }
        }), operators_1.mapTo(host));
    };
}
function dedup(array) {
    var res = [];
    array.forEach(function (a) {
        if (res.indexOf(a) === -1) {
            res.push(a);
        }
    });
    return res;
}
function insertInToString(originalString, pos, toAdd) {
    return originalString.slice(0, pos) + toAdd + originalString.slice(pos);
}
function addNxModule(options) {
    return function (host, context) {
        var angularJson = ast_utils_1.readJsonInTree(host, 'angular.json');
        var app = angularJson.projects[options.name];
        var modulePath = path.resolve('.', ng_ast_utils_1.getAppModulePath(host, app.architect.build.options.main).slice(1));
        var content = fs.readFileSync(modulePath).toString();
        // Bail if the module already cotains the import
        if (content.includes('NxModule.forRoot()')) {
            return host;
        }
        var moduleSource = ts.createSourceFile(modulePath, content, ts.ScriptTarget.Latest, true);
        var importChange = ast_utils_2.insertImport(moduleSource, modulePath, 'NxModule', '@nrwl/nx');
        content = insertInToString(content, importChange.pos, importChange.toAdd);
        moduleSource = ts.createSourceFile(modulePath, content, ts.ScriptTarget.Latest, true);
        var ngModuleChange = ast_utils_1.addImportToModule(moduleSource, modulePath, 'NxModule.forRoot()')[0];
        content = insertInToString(content, ngModuleChange.pos, ngModuleChange.toAdd);
        fs.writeFileSync(modulePath, content);
        return host;
    };
}
function checkCanConvertToWorkspace(options) {
    return function (host, context) {
        try {
            if (!host.exists('package.json')) {
                throw new Error('Cannot find package.json');
            }
            if (!host.exists('angular.json')) {
                throw new Error('Cannot find angular.json');
            }
            // TODO: This restriction should be lited
            var angularJson = ast_utils_1.readJsonInTree(host, 'angular.json');
            if (Object.keys(angularJson.projects).length > 2) {
                throw new Error('Can only convert projects with one app');
            }
            var e2eKey = getE2eKey(angularJson);
            var e2eApp = getE2eProject(angularJson);
            if (e2eApp &&
                !host.exists(e2eApp.architect.e2e.options.protractorConfig)) {
                context.logger.info("Make sure the " + e2eKey + ".architect.e2e.options.protractorConfig is valid or the " + e2eKey + " project is removed from angular.json.");
                throw new Error("An e2e project was specified but " + e2eApp.architect.e2e.options.protractorConfig + " could not be found.");
            }
            return host;
        }
        catch (e) {
            context.logger.error(e.message);
            context.logger.error('Your workspace could not be converted into an Nx Workspace because of the above error.');
            throw e;
        }
    };
}
function addInstallTask(options) {
    return function (host, context) {
        if (!options.skipInstall) {
            context.addTask(new tasks_1.NodePackageInstallTask());
        }
        return host;
    };
}
function default_1(schema) {
    var options = __assign({}, schema, { name: name_utils_1.toFileName(schema.name), npmScope: name_utils_1.toFileName(schema.npmScope || schema.name) });
    var templateSource = schematics_1.apply(schematics_1.url('./files'), [
        schematics_1.template({
            tmpl: ''
        })
    ]);
    return schematics_1.chain([
        checkCanConvertToWorkspace(options),
        schematics_1.mergeWith(templateSource),
        moveExistingFiles(options),
        createAdditionalFiles(options),
        updatePackageJson(),
        updateAngularCLIJson(options),
        updateTsLint(),
        updateProjectTsLint(options),
        updateTsConfig(options),
        updateTsConfigsJson(options),
        addNxModule(options),
        addInstallTask(options)
    ]);
}
exports.default = default_1;
