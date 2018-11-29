"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var name_utils_1 = require("./name-utils");
var appConfig; // configure built in createApp()
var libConfig;
function getAppConfig() {
    return appConfig;
}
exports.getAppConfig = getAppConfig;
function getLibConfig() {
    return libConfig;
}
exports.getLibConfig = getLibConfig;
function createEmptyWorkspace(tree) {
    tree.create('/angular.json', JSON.stringify({ projects: {}, newProjectRoot: '' }));
    tree.create('/package.json', JSON.stringify({
        dependencies: {},
        devDependencies: {}
    }));
    tree.create('/nx.json', JSON.stringify({ npmScope: 'proj', projects: {} }));
    tree.create('/tsconfig.json', JSON.stringify({ compilerOptions: { paths: {} } }));
    tree.create('/tslint.json', JSON.stringify({
        rules: {
            'nx-enforce-module-boundaries': [
                true,
                {
                    npmScope: '<%= npmScope %>',
                    lazyLoad: [],
                    allow: []
                }
            ]
        }
    }));
    return tree;
}
exports.createEmptyWorkspace = createEmptyWorkspace;
function createApp(tree, appName, routing) {
    if (routing === void 0) { routing = true; }
    var _a;
    // save for getAppDir() lookup by external *.spec.ts tests
    appConfig = {
        appName: appName,
        appModule: "/apps/" + appName + "/src/app/app.module.ts"
    };
    tree.create(appConfig.appModule, "\n     import { NgModule } from '@angular/core';\n     import { BrowserModule } from '@angular/platform-browser';\n     " + (routing ? "import { RouterModule } from '@angular/router'" : '') + ";\n     import { AppComponent } from './app.component';\n     @NgModule({\n       imports: [BrowserModule, " + (routing ? 'RouterModule.forRoot([])' : '') + "],\n       declarations: [AppComponent],\n       bootstrap: [AppComponent]\n     })\n     export class AppModule {}\n  ");
    tree.create("/apps/" + appName + "/src/main.ts", "\n    import { enableProdMode } from '@angular/core';\n    import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';\n\n    import { AppModule } from './app/app.module';\n    import { environment } from './environments/environment';\n\n    if (environment.production) {\n      enableProdMode();\n    }\n\n    platformBrowserDynamic()\n      .bootstrapModule(AppModule)\n      .catch(err => console.log(err));\n  ");
    tree.create("/apps/" + appName + "/tsconfig.app.json", JSON.stringify({
        include: ['**/*.ts']
    }));
    tree.create("/apps/" + appName + "-e2e/tsconfig.e2e.json", JSON.stringify({
        include: ['../**/*.ts']
    }));
    tree.overwrite('/angular.json', JSON.stringify({
        newProjectRoot: '',
        projects: (_a = {},
            _a[appName] = {
                root: "apps/" + appName + "/src",
                architect: {
                    build: {
                        options: {
                            main: "apps/" + appName + "/src/main.ts"
                        }
                    }
                }
            },
            _a)
    }));
    return tree;
}
exports.createApp = createApp;
function createLib(tree, libName) {
    var _a = name_utils_1.names(libName), name = _a.name, className = _a.className, fileName = _a.fileName, propertyName = _a.propertyName;
    libConfig = {
        name: name,
        module: "/libs/" + propertyName + "/src/lib/" + fileName + ".module.ts",
        barrel: "/libs/" + propertyName + "/src/index.ts"
    };
    tree.create(libConfig.module, "\n      import { NgModule } from '@angular/core';\n      import { CommonModule } from '@angular/common';\n      @NgModule({\n        imports: [\n          CommonModule\n        ],\n        providers: []\n      })\n      export class " + className + "Module { }\n  ");
    tree.create(libConfig.barrel, "\n    export * from './lib/" + fileName + ".module';\n  ");
    return tree;
}
exports.createLib = createLib;
