"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var testing_1 = require("@angular-devkit/schematics/testing");
var schematics_1 = require("@angular-devkit/schematics");
var test_1 = require("@schematics/angular/utility/test");
var ast_utils_1 = require("../../utils/ast-utils");
var path = require("path");
var name_utils_1 = require("../../utils/name-utils");
var testing_utils_1 = require("../../utils/testing-utils");
describe('ngrx', function () {
    var schematicRunner = new testing_1.SchematicTestRunner('@nrwl/schematics', path.join(__dirname, '../../collection.json'));
    var appTree;
    beforeEach(function () {
        appTree = new schematics_1.VirtualTree();
        appTree = testing_utils_1.createEmptyWorkspace(appTree);
        appTree = testing_utils_1.createApp(appTree, 'myapp');
    });
    it('should add empty root', function () {
        var tree = schematicRunner.runSchematic('ngrx', {
            name: 'state',
            module: 'apps/myapp/src/app/app.module.ts',
            onlyEmptyRoot: true
        }, appTree);
        var appModule = test_1.getFileContent(tree, '/apps/myapp/src/app/app.module.ts');
        expect(tree.exists('apps/myapp/src/app/+state/state.actions.ts')).toBeFalsy();
        expect(appModule).toContain('StoreModule.forRoot({},{ metaReducers : !environment.production ? [storeFreeze] : [] })');
        expect(appModule).toContain('EffectsModule.forRoot');
    });
    it('should add root', function () {
        var tree = schematicRunner.runSchematic('ngrx', {
            name: 'app',
            module: 'apps/myapp/src/app/app.module.ts',
            root: true
        }, appTree);
        [
            '/apps/myapp/src/app/+state/app.actions.ts',
            '/apps/myapp/src/app/+state/app.effects.ts',
            '/apps/myapp/src/app/+state/app.effects.spec.ts',
            '/apps/myapp/src/app/+state/app.reducer.ts',
            '/apps/myapp/src/app/+state/app.reducer.spec.ts',
            '/apps/myapp/src/app/+state/app.selectors.ts',
            '/apps/myapp/src/app/+state/app.selectors.spec.ts'
        ].forEach(function (fileName) {
            expect(tree.exists(fileName)).toBeTruthy();
        });
        // Since we did not include the `--facade` option
        expect(tree.exists('/apps/myapp/src/app/+state/app.facade.ts')).toBeFalsy();
        expect(tree.exists('/apps/myapp/src/app/+state/app.facade.spec.ts')).toBeFalsy();
        var appModule = test_1.getFileContent(tree, '/apps/myapp/src/app/app.module.ts');
        expect(appModule).toContain("import { NxModule } from '@nrwl/nx';");
        expect(appModule).toContain('NxModule.forRoot');
        expect(appModule).toContain('StoreModule.forRoot');
        expect(appModule).toContain('EffectsModule.forRoot');
        expect(appModule).toContain('!environment.production ? [storeFreeze] : []');
        expect(appModule).toContain('app: appReducer');
        expect(appModule).toContain('initialState : { app : appInitialState }');
    });
    it('should add facade to root', function () {
        var tree = schematicRunner.runSchematic('ngrx', {
            name: 'app',
            module: 'apps/myapp/src/app/app.module.ts',
            root: true,
            facade: true
        }, appTree);
        var appModule = test_1.getFileContent(tree, '/apps/myapp/src/app/app.module.ts');
        expect(appModule).toContain("import { NxModule } from '@nrwl/nx';");
        expect(appModule).toContain('NxModule.forRoot');
        expect(appModule).toContain('StoreModule.forRoot');
        expect(appModule).toContain('EffectsModule.forRoot');
        expect(appModule).toContain('!environment.production ? [storeFreeze] : []');
        // Do not add Effects file to providers; already registered in EffectsModule
        expect(appModule).toContain('providers: [AppFacade]');
        expect(appModule).toContain('app: appReducer');
        expect(appModule).toContain('initialState : { app : appInitialState }');
        [
            '/apps/myapp/src/app/+state/app.actions.ts',
            '/apps/myapp/src/app/+state/app.effects.ts',
            '/apps/myapp/src/app/+state/app.effects.spec.ts',
            '/apps/myapp/src/app/+state/app.reducer.ts',
            '/apps/myapp/src/app/+state/app.reducer.spec.ts',
            '/apps/myapp/src/app/+state/app.facade.ts',
            '/apps/myapp/src/app/+state/app.facade.spec.ts',
            '/apps/myapp/src/app/+state/app.selectors.ts',
            '/apps/myapp/src/app/+state/app.selectors.spec.ts'
        ].forEach(function (fileName) {
            expect(tree.exists(fileName)).toBeTruthy();
        });
    });
    it('should not add RouterStoreModule only if the module does not reference the router', function () {
        var newTree = testing_utils_1.createApp(appTree, 'myapp-norouter', false);
        var tree = schematicRunner.runSchematic('ngrx', {
            name: 'app',
            module: 'apps/myapp-norouter/src/app/app.module.ts',
            root: true
        }, newTree);
        var appModule = test_1.getFileContent(tree, '/apps/myapp-norouter/src/app/app.module.ts');
        expect(appModule).not.toContain('StoreRouterConnectingModule');
    });
    it('should add feature', function () {
        var tree = schematicRunner.runSchematic('ngrx', {
            name: 'state',
            module: 'apps/myapp/src/app/app.module.ts'
        }, appTree);
        var appModule = test_1.getFileContent(tree, '/apps/myapp/src/app/app.module.ts');
        expect(appModule).toContain('StoreModule.forFeature');
        expect(appModule).toContain('EffectsModule.forFeature');
        expect(appModule).toContain('STATE_FEATURE_KEY, stateReducer');
        expect(appModule).toContain('{ initialState: stateInitialState }');
        expect(appModule).not.toContain('!environment.production ? [storeFreeze] : []');
        expect(tree.exists("/apps/myapp/src/app/+state/state.actions.ts")).toBeTruthy();
    });
    it('should add with custom directoryName', function () {
        var tree = schematicRunner.runSchematic('ngrx', {
            name: 'state',
            module: 'apps/myapp/src/app/app.module.ts',
            directory: 'myCustomState'
        }, appTree);
        var appModule = test_1.getFileContent(tree, '/apps/myapp/src/app/app.module.ts');
        expect(appModule).toContain('StoreModule.forFeature');
        expect(appModule).toContain('EffectsModule.forFeature');
        expect(appModule).not.toContain('!environment.production ? [storeFreeze] : []');
        expect(tree.exists("/apps/myapp/src/app/my-custom-state/state.actions.ts")).toBeTruthy();
    });
    it('should only add files', function () {
        var tree = schematicRunner.runSchematic('ngrx', {
            name: 'state',
            module: 'apps/myapp/src/app/app.module.ts',
            onlyAddFiles: true,
            facade: true
        }, appTree);
        var appModule = test_1.getFileContent(tree, '/apps/myapp/src/app/app.module.ts');
        expect(appModule).not.toContain('StoreModule');
        expect(appModule).not.toContain('!environment.production ? [storeFreeze] : []');
        [
            '/apps/myapp/src/app/+state/state.effects.ts',
            '/apps/myapp/src/app/+state/state.facade.ts',
            '/apps/myapp/src/app/+state/state.reducer.ts',
            '/apps/myapp/src/app/+state/state.selectors.ts',
            '/apps/myapp/src/app/+state/state.effects.spec.ts',
            '/apps/myapp/src/app/+state/state.facade.spec.ts',
            '/apps/myapp/src/app/+state/state.selectors.spec.ts'
        ].forEach(function (fileName) {
            expect(tree.exists(fileName)).toBeTruthy();
        });
    });
    it('should update package.json', function () {
        var tree = schematicRunner.runSchematic('ngrx', {
            name: 'state',
            module: 'apps/myapp/src/app/app.module.ts'
        }, appTree);
        var packageJson = ast_utils_1.readJsonInTree(tree, 'package.json');
        expect(packageJson.dependencies['@ngrx/store']).toBeDefined();
        expect(packageJson.dependencies['@ngrx/router-store']).toBeDefined();
        expect(packageJson.dependencies['@ngrx/effects']).toBeDefined();
        expect(packageJson.devDependencies['@ngrx/store-devtools']).toBeDefined();
        expect(packageJson.devDependencies['ngrx-store-freeze']).toBeDefined();
    });
    it('should error when no module is provided', function () {
        expect(function () {
            return schematicRunner.runSchematic('ngrx', {
                name: 'state',
                module: ''
            }, appTree);
        }).toThrow('The required --module option must be passed');
    });
    it('should error the module could not be found', function () {
        expect(function () {
            return schematicRunner.runSchematic('ngrx', {
                name: 'state',
                module: 'does-not-exist.ts'
            }, appTree);
        }).toThrow('Path does not exist: does-not-exist.ts');
    });
    describe('code generation', function () {
        it('should scaffold the ngrx "user" files without a facade', function () {
            var appConfig = testing_utils_1.getAppConfig();
            var hasFile = function (file) { return expect(tree.exists(file)).toBeTruthy(); };
            var missingFile = function (file) { return expect(tree.exists(file)).not.toBeTruthy(); };
            var statePath = name_utils_1.findModuleParent(appConfig.appModule) + "/+state";
            var tree = buildNgrxTree(appConfig);
            hasFile(statePath + "/user.actions.ts");
            hasFile(statePath + "/user.effects.ts");
            hasFile(statePath + "/user.effects.spec.ts");
            missingFile(statePath + "/user.facade.ts");
            missingFile(statePath + "/user.facade.spec.ts");
            hasFile(statePath + "/user.reducer.ts");
            hasFile(statePath + "/user.reducer.spec.ts");
            hasFile(statePath + "/user.selectors.ts");
        });
        it('should scaffold the ngrx "user" files WITH a facade', function () {
            var appConfig = testing_utils_1.getAppConfig();
            var hasFile = function (file) { return expect(tree.exists(file)).toBeTruthy(); };
            var tree = buildNgrxTree(appConfig, 'user', true);
            var statePath = name_utils_1.findModuleParent(appConfig.appModule) + "/+state";
            hasFile(statePath + "/user.actions.ts");
            hasFile(statePath + "/user.effects.ts");
            hasFile(statePath + "/user.facade.ts");
            hasFile(statePath + "/user.reducer.ts");
            hasFile(statePath + "/user.selectors.ts");
            hasFile(statePath + "/user.reducer.spec.ts");
            hasFile(statePath + "/user.effects.spec.ts");
            hasFile(statePath + "/user.selectors.spec.ts");
            hasFile(statePath + "/user.facade.spec.ts");
        });
        it('should build the ngrx actions', function () {
            var appConfig = testing_utils_1.getAppConfig();
            var tree = buildNgrxTree(appConfig, 'users');
            var statePath = name_utils_1.findModuleParent(appConfig.appModule) + "/+state";
            var content = test_1.getFileContent(tree, statePath + "/users.actions.ts");
            expect(content).toContain('UsersActionTypes');
            expect(content).toContain('LoadUsers = "[Users] Load Users"');
            expect(content).toContain('UsersLoaded = "[Users] Users Loaded"');
            expect(content).toContain('UsersLoadError = "[Users] Users Load Error"');
            expect(content).toContain('class LoadUsers implements Action');
            expect(content).toContain('class UsersLoaded implements Action');
            expect(content).toContain('type UsersAction = LoadUsers | UsersLoaded | UsersLoadError');
            expect(content).toContain('export const fromUsersActions');
        });
        it('should build the ngrx selectors', function () {
            var appConfig = testing_utils_1.getAppConfig();
            var tree = buildNgrxTree(appConfig, 'users');
            var statePath = name_utils_1.findModuleParent(appConfig.appModule) + "/+state";
            var content = test_1.getFileContent(tree, statePath + "/users.selectors.ts");
            [
                "import { USERS_FEATURE_KEY, UsersState } from './users.reducer'",
                "export const usersQuery"
            ].forEach(function (text) {
                expect(content).toContain(text);
            });
        });
        it('should build the ngrx facade', function () {
            var appConfig = testing_utils_1.getAppConfig();
            var includeFacade = true;
            var tree = buildNgrxTree(appConfig, 'users', includeFacade);
            var statePath = name_utils_1.findModuleParent(appConfig.appModule) + "/+state";
            var content = test_1.getFileContent(tree, statePath + "/users.facade.ts");
            [
                "import { UsersPartialState } from './users.reducer'",
                "import { usersQuery } from './users.selectors'",
                "export class UsersFacade"
            ].forEach(function (text) {
                expect(content).toContain(text);
            });
        });
        it('should build the ngrx reducer', function () {
            var appConfig = testing_utils_1.getAppConfig();
            var tree = buildNgrxTree(appConfig, 'user');
            var statePath = name_utils_1.findModuleParent(appConfig.appModule) + "/+state";
            var content = test_1.getFileContent(tree, statePath + "/user.reducer.ts");
            expect(content).not.toContain('function reducer');
            [
                "import { UserAction, UserActionTypes } from './user.actions'",
                "export interface User",
                "export interface UserState",
                'export function userReducer',
                'state: UserState = initialState',
                'action: UserAction): UserState',
                'case UserActionTypes.UserLoaded'
            ].forEach(function (text) {
                expect(content).toContain(text);
            });
        });
        it('should build the ngrx effects', function () {
            var appConfig = testing_utils_1.getAppConfig();
            var tree = buildNgrxTree(appConfig, 'users');
            var statePath = name_utils_1.findModuleParent(appConfig.appModule) + "/+state";
            var content = test_1.getFileContent(tree, statePath + "/users.effects.ts");
            [
                "import { DataPersistence } from '@nrwl/nx'",
                "import { LoadUsers, UsersLoaded, UsersLoadError, UsersActionTypes } from './users.actions'",
                "loadUsers$",
                "run: (action: LoadUsers, state: UsersPartialState)",
                "return new UsersLoaded([])",
                "return new UsersLoadError(error)",
                'private actions$: Actions',
                'private dataPersistence: DataPersistence<UsersPartialState>)'
            ].forEach(function (text) {
                expect(content).toContain(text);
            });
        });
    });
    describe('unit tests', function () {
        it('should produce proper specs for the ngrx reducer', function () {
            var appConfig = testing_utils_1.getAppConfig();
            var tree = buildNgrxTree(appConfig);
            var statePath = name_utils_1.findModuleParent(appConfig.appModule) + "/+state";
            var contents = tree.readContent(statePath + "/user.reducer.spec.ts");
            expect(contents).toContain("describe('User Reducer', () => {");
            expect(contents).toContain('const result = userReducer(initialState, action);');
        });
        it('should update the barrel API with exports for ngrx facade, selector, and reducer', function () {
            appTree = testing_utils_1.createLib(appTree, 'flights');
            var libConfig = testing_utils_1.getLibConfig();
            var tree = schematicRunner.runSchematic('ngrx', {
                name: 'super-users',
                module: libConfig.module,
                facade: true
            }, appTree);
            var barrel = tree.readContent(libConfig.barrel);
            expect(barrel).toContain("export * from './lib/+state/super-users.facade';");
        });
        it('should not update the barrel API with a facade', function () {
            appTree = testing_utils_1.createLib(appTree, 'flights');
            var libConfig = testing_utils_1.getLibConfig();
            var tree = schematicRunner.runSchematic('ngrx', {
                name: 'super-users',
                module: libConfig.module,
                facade: false
            }, appTree);
            var barrel = tree.readContent(libConfig.barrel);
            expect(barrel).not.toContain("export * from './lib/+state/super-users.facade';");
        });
        it('should produce proper tests for the ngrx reducer for a name with a dash', function () {
            var appConfig = testing_utils_1.getAppConfig();
            var tree = schematicRunner.runSchematic('ngrx', {
                name: 'super-users',
                module: appConfig.appModule
            }, appTree);
            var statePath = name_utils_1.findModuleParent(appConfig.appModule) + "/+state";
            var contents = tree.readContent(statePath + "/super-users.reducer.spec.ts");
            expect(contents).toContain("describe('SuperUsers Reducer', () => {");
            expect(contents).toContain("const result = superUsersReducer(initialState, action);");
        });
    });
    function buildNgrxTree(appConfig, featureName, withFacade) {
        if (featureName === void 0) { featureName = 'user'; }
        if (withFacade === void 0) { withFacade = false; }
        return schematicRunner.runSchematic('ngrx', {
            name: featureName,
            module: appConfig.appModule,
            facade: withFacade
        }, appTree);
    }
});
