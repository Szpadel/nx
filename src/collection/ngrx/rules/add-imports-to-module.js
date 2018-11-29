"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ast_utils_1 = require("@schematics/angular/utility/ast-utils");
var ts = require("typescript");
var name_utils_1 = require("../../../utils/name-utils");
var ast_utils_2 = require("../../../utils/ast-utils");
function addImportsToModule(context) {
    var _this = this;
    return function (host) {
        var modulePath = context.options.module;
        var sourceText = host.read(modulePath).toString('utf-8');
        var source = ts.createSourceFile(modulePath, sourceText, ts.ScriptTarget.Latest, true);
        var addImport = function (symbolName, fileName) {
            return ast_utils_1.insertImport(source, modulePath, symbolName, fileName);
        };
        var dir = "./" + name_utils_1.toFileName(context.options.directory);
        var pathPrefix = dir + "/" + name_utils_1.toFileName(context.featureName);
        var reducerPath = pathPrefix + ".reducer";
        var effectsPath = pathPrefix + ".effects";
        var facadePath = pathPrefix + ".facade";
        var featureName = "" + name_utils_1.toPropertyName(context.featureName);
        var reducerName = name_utils_1.toPropertyName(context.featureName) + "Reducer";
        var effectsName = name_utils_1.toClassName(context.featureName) + "Effects";
        var facadeName = name_utils_1.toClassName(context.featureName) + "Facade";
        var reducerImports = featureName.toUpperCase() + "_FEATURE_KEY, initialState as " + featureName + "InitialState, " + reducerName;
        var storeReducers = "{ " + featureName + ": " + reducerName + " }";
        var storeInitState = "initialState : { " + featureName + " : " + featureName + "InitialState }";
        var storeMetaReducers = "metaReducers : !environment.production ? [storeFreeze] : []";
        var storeForRoot = "StoreModule.forRoot(\n  " + storeReducers + ",\n  {\n    " + storeInitState + ",\n    " + storeMetaReducers + "\n  }\n)";
        var nxModule = 'NxModule.forRoot()';
        var storeForEmptyRoot = "StoreModule.forRoot({},{ " + storeMetaReducers + " })";
        var effectsForRoot = "EffectsModule.forRoot([" + effectsName + "])";
        var effectsForEmptyRoot = "EffectsModule.forRoot([])";
        var storeForFeature = "StoreModule.forFeature(" + featureName.toUpperCase() + "_FEATURE_KEY, " + reducerName + ", { initialState: " + featureName + "InitialState })";
        var effectsForFeature = "EffectsModule.forFeature([" + effectsName + "])";
        var devTools = "!environment.production ? StoreDevtoolsModule.instrument() : []";
        var storeRouterModule = 'StoreRouterConnectingModule';
        // InsertImport [symbol,source] value pairs
        var nxModuleImport = ['NxModule', '@nrwl/nx'];
        var storeModule = ['StoreModule', '@ngrx/store'];
        var effectsModule = ['EffectsModule', '@ngrx/effects'];
        var storeDevTools = ['StoreDevtoolsModule', '@ngrx/store-devtools'];
        var environment = ['environment', '../environments/environment'];
        var storeRouter = ['StoreRouterConnectingModule', '@ngrx/router-store'];
        var storeFreeze = ['storeFreeze', 'ngrx-store-freeze'];
        // this is just a heuristic
        var hasRouter = sourceText.indexOf('RouterModule') > -1;
        var hasNxModule = sourceText.includes('NxModule.forRoot()');
        if (context.options.onlyEmptyRoot) {
            ast_utils_2.insert(host, modulePath, [
                addImport.apply(_this, storeModule),
                addImport.apply(_this, effectsModule),
                addImport.apply(_this, storeDevTools),
                addImport.apply(_this, environment)
            ].concat((hasRouter ? [addImport.apply(_this, storeRouter)] : []), [
                addImport.apply(_this, storeFreeze)
            ], ast_utils_2.addImportToModule(source, modulePath, storeForEmptyRoot), ast_utils_2.addImportToModule(source, modulePath, effectsForEmptyRoot), ast_utils_2.addImportToModule(source, modulePath, devTools), (hasRouter
                ? ast_utils_2.addImportToModule(source, modulePath, storeRouterModule)
                : [])));
        }
        else {
            var common = [
                addImport.apply(_this, storeModule),
                addImport.apply(_this, effectsModule),
                addImport(reducerImports, reducerPath),
                addImport(effectsName, effectsPath)
            ];
            if (context.options.facade) {
                common = common.concat([
                    addImport(facadeName, facadePath)
                ], ast_utils_2.addProviderToModule(source, modulePath, "" + facadeName));
            }
            if (context.options.root) {
                ast_utils_2.insert(host, modulePath, common.concat((!hasNxModule ? [addImport.apply(_this, nxModuleImport)] : []), [
                    addImport.apply(_this, storeDevTools),
                    addImport.apply(_this, environment)
                ], (hasRouter ? [addImport.apply(_this, storeRouter)] : []), [
                    addImport.apply(_this, storeFreeze)
                ], (!hasNxModule
                    ? ast_utils_2.addImportToModule(source, modulePath, nxModule)
                    : []), ast_utils_2.addImportToModule(source, modulePath, storeForRoot), ast_utils_2.addImportToModule(source, modulePath, effectsForRoot), ast_utils_2.addImportToModule(source, modulePath, devTools), (hasRouter
                    ? ast_utils_2.addImportToModule(source, modulePath, storeRouterModule)
                    : [])));
            }
            else {
                ast_utils_2.insert(host, modulePath, common.concat(ast_utils_2.addImportToModule(source, modulePath, storeForFeature), ast_utils_2.addImportToModule(source, modulePath, effectsForFeature)));
            }
        }
        return host;
    };
}
exports.addImportsToModule = addImportsToModule;
