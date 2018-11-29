/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT- style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Rule, Tree } from '@angular-devkit/schematics';
import { Change, InsertChange } from '@schematics/angular/utility/change';
import * as ts from 'typescript';
export declare function addReexport(source: ts.SourceFile, modulePath: string, reexportedFileName: string, token: string): Change[];
export declare function addParameterToConstructor(source: ts.SourceFile, modulePath: string, opts: {
    className: string;
    param: string;
}): Change[];
export declare function addMethod(source: ts.SourceFile, modulePath: string, opts: {
    className: string;
    methodHeader: string;
    body: string;
}): Change[];
export declare function removeFromNgModule(source: ts.SourceFile, modulePath: string, property: string): Change[];
export declare function findClass(source: ts.SourceFile, className: string, silent?: boolean): ts.ClassDeclaration;
export declare function offset(text: string, numberOfTabs: number, wrap: boolean): string;
export declare function addImportToModule(source: ts.SourceFile, modulePath: string, symbolName: string): Change[];
export declare function addImportToTestBed(source: ts.SourceFile, specPath: string, symbolName: string): Change[];
export declare function getBootstrapComponent(source: ts.SourceFile, moduleClassName: string): string;
export declare function addRoute(ngModulePath: string, source: ts.SourceFile, route: string): Change[];
export declare function addIncludeToTsConfig(tsConfigPath: string, source: ts.SourceFile, include: string): Change[];
export declare function getImport(source: ts.SourceFile, predicate: (a: any) => boolean): {
    moduleSpec: string;
    bindings: string[];
}[];
export declare function addProviderToModule(source: ts.SourceFile, modulePath: string, symbolName: string): Change[];
export declare function addDeclarationToModule(source: ts.SourceFile, modulePath: string, symbolName: string): Change[];
export declare function addEntryComponents(source: ts.SourceFile, modulePath: string, symbolName: string): Change[];
export declare function addGlobal(source: ts.SourceFile, modulePath: string, statement: string): Change[];
export declare function insert(host: Tree, modulePath: string, changes: Change[]): void;
/**
 * This method is specifically for reading JSON files in a Tree
 * @param host The host tree
 * @param path The path to the JSON file
 * @returns The JSON data in the file.
 */
export declare function readJsonInTree<T = any>(host: Tree, path: string): T;
/**
 * This method is specifically for updating JSON in a Tree
 * @param path Path of JSON file in the Tree
 * @param callback Manipulation of the JSON data
 * @returns A rule which updates a JSON file file in a Tree
 */
export declare function updateJsonInTree<T = any, O = T>(path: string, callback: (json: T) => O): Rule;
export declare function getProjectConfig(host: Tree, name: string): any;
export declare function updateProjectConfig(name: string, projectConfig: any): Rule;
export declare function readBootstrapInfo(host: Tree, app: string): {
    moduleSpec: string;
    modulePath: string;
    mainPath: string;
    moduleClassName: string;
    moduleSource: ts.SourceFile;
    bootstrapComponentClassName: string;
    bootstrapComponentFileName: string;
};
export declare function addClass(source: ts.SourceFile, modulePath: string, clazzName: string, clazzSrc: string): Change;
/**
 * e.g
 * ```ts
 *   export type <Feature>Actions = <Feature> | Load<Feature>s | <Feature>sLoaded | <Feature>sLoadError;
 * ```
 */
export declare function addUnionTypes(source: ts.SourceFile, modulePath: string, typeName: string, typeValues: string[]): InsertChange;
/**
 * Add 1..n enumerators using name + (optional) value pairs
 */
export declare function addEnumeratorValues(source: ts.SourceFile, modulePath: string, enumName: string, pairs?: NameValue[]): Change[];
export declare function findNodesOfType(source: ts.Node, kind: ts.SyntaxKind, predicate: (a: any) => boolean, extract?: (a: any) => any, firstOnly?: boolean): any;
export interface NameValue {
    name: string;
    value?: string;
}
export declare function createOrUpdate(host: Tree, path: string, content: string): void;
export declare function insertImport(source: ts.SourceFile, fileToEdit: string, symbolName: string, fileName: string, isDefault?: boolean): Change;
export declare function getDecoratorPropertyValueNode(host: Tree, modulePath: string, identifier: string, property: string, module: string): ts.Node;
export declare function replaceNodeValue(host: Tree, modulePath: string, node: ts.Node, content: string): void;
