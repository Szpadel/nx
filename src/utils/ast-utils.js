"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ast_utils_1 = require("@schematics/angular/utility/ast-utils");
var change_1 = require("@schematics/angular/utility/change");
var ts = require("typescript");
var path = require("path");
var name_utils_1 = require("./name-utils");
var fileutils_1 = require("./fileutils");
var stripJsonComments = require("strip-json-comments");
function addReexport(source, modulePath, reexportedFileName, token) {
    var allExports = ast_utils_1.findNodes(source, ts.SyntaxKind.ExportDeclaration);
    if (allExports.length > 0) {
        var m = allExports.filter(function (e) {
            return e.moduleSpecifier.getText(source).indexOf(reexportedFileName) > -1;
        });
        if (m.length > 0) {
            var mm = m[0];
            return [
                new change_1.InsertChange(modulePath, mm.exportClause.end - 1, ", " + token + " ")
            ];
        }
    }
    return [];
}
exports.addReexport = addReexport;
// This should be moved to @schematics/angular once it allows to pass custom expressions as providers
function _addSymbolToNgModuleMetadata(source, ngModulePath, metadataField, expression) {
    var nodes = ast_utils_1.getDecoratorMetadata(source, 'NgModule', '@angular/core');
    var node = nodes[0]; // tslint:disable-line:no-any
    // Find the decorator declaration.
    if (!node) {
        return [];
    }
    // Get all the children property assignment of object literals.
    var matchingProperties = node.properties
        .filter(function (prop) { return prop.kind == ts.SyntaxKind.PropertyAssignment; })
        // Filter out every fields that's not "metadataField". Also handles string literals
        // (but not expressions).
        .filter(function (prop) {
        var name = prop.name;
        switch (name.kind) {
            case ts.SyntaxKind.Identifier:
                return name.getText(source) == metadataField;
            case ts.SyntaxKind.StringLiteral:
                return name.text == metadataField;
        }
        return false;
    });
    // Get the last node of the array literal.
    if (!matchingProperties) {
        return [];
    }
    if (matchingProperties.length == 0) {
        // We haven't found the field in the metadata declaration. Insert a new field.
        var expr = node;
        var position_1;
        var toInsert_1;
        if (expr.properties.length == 0) {
            position_1 = expr.getEnd() - 1;
            toInsert_1 = "  " + metadataField + ": [" + expression + "]\n";
        }
        else {
            node = expr.properties[expr.properties.length - 1];
            position_1 = node.getEnd();
            // Get the indentation of the last element, if any.
            var text = node.getFullText(source);
            if (text.match('^\r?\r?\n')) {
                toInsert_1 = "," + text.match(/^\r?\n\s+/)[0] + metadataField + ": [" + expression + "]";
            }
            else {
                toInsert_1 = ", " + metadataField + ": [" + expression + "]";
            }
        }
        var newMetadataProperty = new change_1.InsertChange(ngModulePath, position_1, toInsert_1);
        return [newMetadataProperty];
    }
    var assignment = matchingProperties[0];
    // If it's not an array, nothing we can do really.
    if (assignment.initializer.kind !== ts.SyntaxKind.ArrayLiteralExpression) {
        return [];
    }
    var arrLiteral = assignment.initializer;
    if (arrLiteral.elements.length == 0) {
        // Forward the property.
        node = arrLiteral;
    }
    else {
        node = arrLiteral.elements;
    }
    if (!node) {
        console.log('No app module found. Please add your new class to your component.');
        return [];
    }
    if (Array.isArray(node)) {
        var nodeArray = node;
        var symbolsArray = nodeArray.map(function (node) { return node.getText(); });
        if (symbolsArray.includes(expression)) {
            return [];
        }
        node = node[node.length - 1];
    }
    var toInsert;
    var position = node.getEnd();
    if (node.kind == ts.SyntaxKind.ObjectLiteralExpression) {
        // We haven't found the field in the metadata declaration. Insert a new
        // field.
        var expr = node;
        if (expr.properties.length == 0) {
            position = expr.getEnd() - 1;
            toInsert = "  " + metadataField + ": [" + expression + "]\n";
        }
        else {
            node = expr.properties[expr.properties.length - 1];
            position = node.getEnd();
            // Get the indentation of the last element, if any.
            var text = node.getFullText(source);
            if (text.match('^\r?\r?\n')) {
                toInsert = "," + text.match(/^\r?\n\s+/)[0] + metadataField + ": [" + expression + "]";
            }
            else {
                toInsert = ", " + metadataField + ": [" + expression + "]";
            }
        }
    }
    else if (node.kind == ts.SyntaxKind.ArrayLiteralExpression) {
        // We found the field but it's empty. Insert it just before the `]`.
        position--;
        toInsert = "" + expression;
    }
    else {
        // Get the indentation of the last element, if any.
        var text = node.getFullText(source);
        if (text.match(/^\r?\n/)) {
            toInsert = "," + text.match(/^\r?\n(\r?)\s+/)[0] + expression;
        }
        else {
            toInsert = ", " + expression;
        }
    }
    var insert = new change_1.InsertChange(ngModulePath, position, toInsert);
    return [insert];
}
function addParameterToConstructor(source, modulePath, opts) {
    var clazz = findClass(source, opts.className);
    var constructor = clazz.members.filter(function (m) { return m.kind === ts.SyntaxKind.Constructor; })[0];
    if (constructor) {
        throw new Error('Should be tested');
    }
    else {
        var methodHeader = "constructor(" + opts.param + ")";
        return addMethod(source, modulePath, {
            className: opts.className,
            methodHeader: methodHeader,
            body: null
        });
    }
}
exports.addParameterToConstructor = addParameterToConstructor;
function addMethod(source, modulePath, opts) {
    var clazz = findClass(source, opts.className);
    var body = opts.body
        ? "\n" + opts.methodHeader + " {\n" + offset(opts.body, 1, false) + "\n}\n"
        : "\n" + opts.methodHeader + " {}\n";
    return [new change_1.InsertChange(modulePath, clazz.end - 1, offset(body, 1, true))];
}
exports.addMethod = addMethod;
function removeFromNgModule(source, modulePath, property) {
    var nodes = ast_utils_1.getDecoratorMetadata(source, 'NgModule', '@angular/core');
    var node = nodes[0]; // tslint:disable-line:no-any
    // Find the decorator declaration.
    if (!node) {
        return [];
    }
    // Get all the children property assignment of object literals.
    var matchingProperty = getMatchingProperty(source, property, 'NgModule', '@angular/core');
    if (matchingProperty) {
        return [
            new change_1.RemoveChange(modulePath, matchingProperty.pos, matchingProperty.getFullText(source))
        ];
    }
    else {
        return [];
    }
}
exports.removeFromNgModule = removeFromNgModule;
function findClass(source, className, silent) {
    if (silent === void 0) { silent = false; }
    var nodes = ast_utils_1.getSourceNodes(source);
    var clazz = nodes.filter(function (n) {
        return n.kind === ts.SyntaxKind.ClassDeclaration &&
            n.name.text === className;
    })[0];
    if (!clazz && !silent) {
        throw new Error("Cannot find class '" + className + "'");
    }
    return clazz;
}
exports.findClass = findClass;
function offset(text, numberOfTabs, wrap) {
    var lines = text
        .trim()
        .split('\n')
        .map(function (line) {
        var tabs = '';
        for (var c = 0; c < numberOfTabs; ++c) {
            tabs += '  ';
        }
        return "" + tabs + line;
    })
        .join('\n');
    return wrap ? "\n" + lines + "\n" : lines;
}
exports.offset = offset;
function addImportToModule(source, modulePath, symbolName) {
    return _addSymbolToNgModuleMetadata(source, modulePath, 'imports', symbolName);
}
exports.addImportToModule = addImportToModule;
function addImportToTestBed(source, specPath, symbolName) {
    var allCalls = ast_utils_1.findNodes(source, ts.SyntaxKind.CallExpression);
    var configureTestingModuleObjectLiterals = allCalls
        .filter(function (c) { return c.expression.kind === ts.SyntaxKind.PropertyAccessExpression; })
        .filter(function (c) { return c.expression.name.getText(source) === 'configureTestingModule'; })
        .map(function (c) {
        return c.arguments[0].kind === ts.SyntaxKind.ObjectLiteralExpression
            ? c.arguments[0]
            : null;
    });
    if (configureTestingModuleObjectLiterals.length > 0) {
        var startPosition = configureTestingModuleObjectLiterals[0]
            .getFirstToken(source)
            .getEnd();
        return [
            new change_1.InsertChange(specPath, startPosition, "imports: [" + symbolName + "], ")
        ];
    }
    else {
        return [];
    }
}
exports.addImportToTestBed = addImportToTestBed;
function getBootstrapComponent(source, moduleClassName) {
    var bootstrap = getMatchingProperty(source, 'bootstrap', 'NgModule', '@angular/core');
    if (!bootstrap) {
        throw new Error("Cannot find bootstrap components in '" + moduleClassName + "'");
    }
    var c = bootstrap.getChildren();
    var nodes = c[c.length - 1].getChildren();
    var bootstrapComponent = nodes.slice(1, nodes.length - 1)[0];
    if (!bootstrapComponent) {
        throw new Error("Cannot find bootstrap components in '" + moduleClassName + "'");
    }
    return bootstrapComponent.getText();
}
exports.getBootstrapComponent = getBootstrapComponent;
function getMatchingObjectLiteralElement(node, source, property) {
    return (node.properties
        .filter(function (prop) { return prop.kind == ts.SyntaxKind.PropertyAssignment; })
        // Filter out every fields that's not "metadataField". Also handles string literals
        // (but not expressions).
        .filter(function (prop) {
        var name = prop.name;
        switch (name.kind) {
            case ts.SyntaxKind.Identifier:
                return name.getText(source) === property;
            case ts.SyntaxKind.StringLiteral:
                return name.text === property;
        }
        return false;
    })[0]);
}
function getMatchingProperty(source, property, identifier, module) {
    var nodes = ast_utils_1.getDecoratorMetadata(source, identifier, module);
    var node = nodes[0]; // tslint:disable-line:no-any
    if (!node)
        return null;
    // Get all the children property assignment of object literals.
    return getMatchingObjectLiteralElement(node, source, property);
}
function addRoute(ngModulePath, source, route) {
    var routes = getListOfRoutes(source);
    if (!routes)
        return [];
    if (routes.hasTrailingComma || routes.length === 0) {
        return [new change_1.InsertChange(ngModulePath, routes.end, route)];
    }
    else {
        return [new change_1.InsertChange(ngModulePath, routes.end, ", " + route)];
    }
}
exports.addRoute = addRoute;
function addIncludeToTsConfig(tsConfigPath, source, include) {
    var includeKeywordPos = source.text.indexOf('"include":');
    if (includeKeywordPos > -1) {
        var includeArrayEndPos = source.text.indexOf(']', includeKeywordPos);
        return [new change_1.InsertChange(tsConfigPath, includeArrayEndPos, include)];
    }
    else {
        return [];
    }
}
exports.addIncludeToTsConfig = addIncludeToTsConfig;
function getListOfRoutes(source) {
    var imports = getMatchingProperty(source, 'imports', 'NgModule', '@angular/core');
    if (imports.initializer.kind === ts.SyntaxKind.ArrayLiteralExpression) {
        var a = imports.initializer;
        for (var _i = 0, _a = a.elements; _i < _a.length; _i++) {
            var e = _a[_i];
            if (e.kind === ts.SyntaxKind.CallExpression) {
                var ee = e;
                var text = ee.expression.getText(source);
                if ((text === 'RouterModule.forRoot' ||
                    text === 'RouterModule.forChild') &&
                    ee.arguments.length > 0) {
                    var routes = ee.arguments[0];
                    if (routes.kind === ts.SyntaxKind.ArrayLiteralExpression) {
                        return routes.elements;
                    }
                }
            }
        }
    }
    return null;
}
function getImport(source, predicate) {
    var allImports = ast_utils_1.findNodes(source, ts.SyntaxKind.ImportDeclaration);
    var matching = allImports.filter(function (i) {
        return predicate(i.moduleSpecifier.getText());
    });
    return matching.map(function (i) {
        var moduleSpec = i.moduleSpecifier
            .getText()
            .substring(1, i.moduleSpecifier.getText().length - 1);
        var t = i.importClause.namedBindings.getText();
        var bindings = t
            .replace('{', '')
            .replace('}', '')
            .split(',')
            .map(function (q) { return q.trim(); });
        return { moduleSpec: moduleSpec, bindings: bindings };
    });
}
exports.getImport = getImport;
function addProviderToModule(source, modulePath, symbolName) {
    return _addSymbolToNgModuleMetadata(source, modulePath, 'providers', symbolName);
}
exports.addProviderToModule = addProviderToModule;
function addDeclarationToModule(source, modulePath, symbolName) {
    return _addSymbolToNgModuleMetadata(source, modulePath, 'declarations', symbolName);
}
exports.addDeclarationToModule = addDeclarationToModule;
function addEntryComponents(source, modulePath, symbolName) {
    return _addSymbolToNgModuleMetadata(source, modulePath, 'entryComponents', symbolName);
}
exports.addEntryComponents = addEntryComponents;
function addGlobal(source, modulePath, statement) {
    var allImports = ast_utils_1.findNodes(source, ts.SyntaxKind.ImportDeclaration);
    if (allImports.length > 0) {
        var lastImport = allImports[allImports.length - 1];
        return [
            new change_1.InsertChange(modulePath, lastImport.end + 1, "\n" + statement + "\n")
        ];
    }
    else {
        return [new change_1.InsertChange(modulePath, 0, statement + "\n")];
    }
}
exports.addGlobal = addGlobal;
function insert(host, modulePath, changes) {
    var recorder = host.beginUpdate(modulePath);
    for (var _i = 0, changes_1 = changes; _i < changes_1.length; _i++) {
        var change = changes_1[_i];
        if (change instanceof change_1.InsertChange) {
            recorder.insertLeft(change.pos, change.toAdd);
        }
        else if (change instanceof change_1.RemoveChange) {
            recorder.remove(change.pos - 1, change.toRemove.length + 1);
        }
        else if (change instanceof change_1.NoopChange) {
            // do nothing
        }
        else if (change instanceof change_1.ReplaceChange) {
            var action = change;
            recorder.remove(action.pos + 1, action.oldText.length);
            recorder.insertLeft(action.pos + 1, action.newText);
        }
        else {
            throw new Error("Unexpected Change '" + change + "'");
        }
    }
    host.commitUpdate(recorder);
}
exports.insert = insert;
/**
 * This method is specifically for reading JSON files in a Tree
 * @param host The host tree
 * @param path The path to the JSON file
 * @returns The JSON data in the file.
 */
function readJsonInTree(host, path) {
    if (!host.exists(path)) {
        throw new Error("Cannot find " + path);
    }
    return JSON.parse(stripJsonComments(host.read(path).toString('utf-8')));
}
exports.readJsonInTree = readJsonInTree;
/**
 * This method is specifically for updating JSON in a Tree
 * @param path Path of JSON file in the Tree
 * @param callback Manipulation of the JSON data
 * @returns A rule which updates a JSON file file in a Tree
 */
function updateJsonInTree(path, callback) {
    return function (host) {
        host.overwrite(path, fileutils_1.serializeJson(callback(readJsonInTree(host, path))));
        return host;
    };
}
exports.updateJsonInTree = updateJsonInTree;
function getProjectConfig(host, name) {
    var angularJson = readJsonInTree(host, '/angular.json');
    var projectConfig = angularJson.projects[name];
    if (!projectConfig) {
        throw new Error("Cannot find project '" + name + "'");
    }
    else {
        return projectConfig;
    }
}
exports.getProjectConfig = getProjectConfig;
function updateProjectConfig(name, projectConfig) {
    return updateJsonInTree('/angular.json', function (angularJson) {
        angularJson.projects[name] = projectConfig;
        return angularJson;
    });
}
exports.updateProjectConfig = updateProjectConfig;
function readBootstrapInfo(host, app) {
    var config = getProjectConfig(host, app);
    var mainPath;
    try {
        mainPath = config.architect.build.options.main;
    }
    catch (e) {
        throw new Error('Main file cannot be located');
    }
    if (!host.exists(mainPath)) {
        throw new Error('Main file cannot be located');
    }
    var mainSource = host.read(mainPath).toString('utf-8');
    var main = ts.createSourceFile(mainPath, mainSource, ts.ScriptTarget.Latest, true);
    var moduleImports = getImport(main, function (s) { return s.indexOf('.module') > -1; });
    if (moduleImports.length !== 1) {
        throw new Error("main.ts can only import a single module");
    }
    var moduleImport = moduleImports[0];
    var moduleClassName = moduleImport.bindings.filter(function (b) {
        return b.endsWith('Module');
    })[0];
    var modulePath = path.join(path.dirname(mainPath), moduleImport.moduleSpec) + ".ts";
    if (!host.exists(modulePath)) {
        throw new Error("Cannot find '" + modulePath + "'");
    }
    var moduleSourceText = host.read(modulePath).toString('utf-8');
    var moduleSource = ts.createSourceFile(modulePath, moduleSourceText, ts.ScriptTarget.Latest, true);
    var bootstrapComponentClassName = getBootstrapComponent(moduleSource, moduleClassName);
    var bootstrapComponentFileName = "./" + path.join(path.dirname(moduleImport.moduleSpec), name_utils_1.toFileName(bootstrapComponentClassName.substring(0, bootstrapComponentClassName.length - 9)) + ".component");
    return {
        moduleSpec: moduleImport.moduleSpec,
        mainPath: mainPath,
        modulePath: modulePath,
        moduleSource: moduleSource,
        moduleClassName: moduleClassName,
        bootstrapComponentClassName: bootstrapComponentClassName,
        bootstrapComponentFileName: bootstrapComponentFileName
    };
}
exports.readBootstrapInfo = readBootstrapInfo;
function addClass(source, modulePath, clazzName, clazzSrc) {
    if (!findClass(source, clazzName, true)) {
        var nodes = ast_utils_1.findNodes(source, ts.SyntaxKind.ClassDeclaration);
        return ast_utils_1.insertAfterLastOccurrence(nodes, offset(clazzSrc, 0, true), modulePath, 0, ts.SyntaxKind.ClassDeclaration);
    }
    return new change_1.NoopChange();
}
exports.addClass = addClass;
/**
 * e.g
 * ```ts
 *   export type <Feature>Actions = <Feature> | Load<Feature>s | <Feature>sLoaded | <Feature>sLoadError;
 * ```
 */
function addUnionTypes(source, modulePath, typeName, typeValues) {
    var target = findNodesOfType(source, ts.SyntaxKind.TypeAliasDeclaration, function (it) { return it.name.getText() === typeName; });
    if (!target) {
        throw new Error("Cannot find union type '" + typeName + "'");
    }
    var node = target.type;
    // Append new types to create a union type...
    return new change_1.InsertChange(modulePath, node.end, [''].concat(typeValues).join(' | '));
}
exports.addUnionTypes = addUnionTypes;
/**
 * Add 1..n enumerators using name + (optional) value pairs
 */
function addEnumeratorValues(source, modulePath, enumName, pairs) {
    if (pairs === void 0) { pairs = []; }
    var target = findNodesOfType(source, ts.SyntaxKind.EnumDeclaration, function (it) { return it.name.getText() === enumName; });
    var list = target ? target.members : undefined;
    if (!target) {
        throw new Error("Cannot find enum '" + enumName + "'");
    }
    var addComma = !(list.hasTrailingComma || list.length === 0);
    return pairs.reduce(function (buffer, it) {
        var member = it.value ? it.name + " = '" + it.value + "'" : it.name;
        var memberExists = function () {
            return list.filter(function (m) { return m.name.getText() === it.name; }).length;
        };
        if (memberExists()) {
            throw new Error("Enum '" + enumName + "." + it.name + "' already exists");
        }
        return buffer.concat([
            new change_1.InsertChange(modulePath, list.end, (addComma ? ', ' : '') + member)
        ]);
    }, []);
}
exports.addEnumeratorValues = addEnumeratorValues;
/**
 * Find Enum declaration in source based on name
 * e.g.
 *    export enum ProductsActionTypes {
 *       ProductsAction = '[Products] Action'
 *    }
 */
var IDENTITY = function (a) { return a; };
var ɵ0 = IDENTITY;
exports.ɵ0 = ɵ0;
function findNodesOfType(source, kind, predicate, extract, firstOnly) {
    if (extract === void 0) { extract = IDENTITY; }
    if (firstOnly === void 0) { firstOnly = true; }
    var nodes = ast_utils_1.findNodes(source, kind);
    var matching = nodes.filter(function (i) { return predicate(i); }).map(extract);
    return matching.length ? (firstOnly ? matching[0] : matching) : undefined;
}
exports.findNodesOfType = findNodesOfType;
function createOrUpdate(host, path, content) {
    if (host.exists(path)) {
        host.overwrite(path, content);
    }
    else {
        host.create(path, content);
    }
}
exports.createOrUpdate = createOrUpdate;
function insertImport(source, fileToEdit, symbolName, fileName, isDefault) {
    if (isDefault === void 0) { isDefault = false; }
    var rootNode = source;
    var allImports = ast_utils_1.findNodes(rootNode, ts.SyntaxKind.ImportDeclaration);
    // get nodes that map to import statements from the file fileName
    var relevantImports = allImports.filter(function (node) {
        // StringLiteral of the ImportDeclaration is the import file (fileName in this case).
        var importFiles = node
            .getChildren()
            .filter(function (child) { return child.kind === ts.SyntaxKind.StringLiteral; })
            .map(function (n) { return n.text; });
        return importFiles.filter(function (file) { return file === fileName; }).length === 1;
    });
    if (relevantImports.length > 0) {
        var importsAsterisk_1 = false;
        // imports from import file
        var imports_1 = [];
        relevantImports.forEach(function (n) {
            Array.prototype.push.apply(imports_1, ast_utils_1.findNodes(n, ts.SyntaxKind.Identifier));
            if (ast_utils_1.findNodes(n, ts.SyntaxKind.AsteriskToken).length > 0) {
                importsAsterisk_1 = true;
            }
        });
        // if imports * from fileName, don't add symbolName
        if (importsAsterisk_1) {
            return new change_1.NoopChange();
        }
        var importTextNodes = imports_1.filter(function (n) { return n.text === symbolName; });
        // insert import if it's not there
        if (importTextNodes.length === 0) {
            var fallbackPos_1 = ast_utils_1.findNodes(relevantImports[0], ts.SyntaxKind.CloseBraceToken)[0].getStart() ||
                ast_utils_1.findNodes(relevantImports[0], ts.SyntaxKind.FromKeyword)[0].getStart();
            return ast_utils_1.insertAfterLastOccurrence(imports_1, ", " + symbolName, fileToEdit, fallbackPos_1);
        }
        return new change_1.NoopChange();
    }
    // no such import declaration exists
    var useStrict = ast_utils_1.findNodes(rootNode, ts.SyntaxKind.StringLiteral).filter(function (n) { return n.text === 'use strict'; });
    var fallbackPos = 0;
    if (useStrict.length > 0) {
        fallbackPos = useStrict[0].end;
    }
    var open = isDefault ? '' : '{ ';
    var close = isDefault ? '' : ' }';
    // if there are no imports or 'use strict' statement, insert import at beginning of file
    var insertAtBeginning = allImports.length === 0 && useStrict.length === 0;
    var separator = insertAtBeginning ? '' : ';\n';
    var toInsert = separator + "import " + open + symbolName + close +
        (" from '" + fileName + "'" + (insertAtBeginning ? ';\n' : ''));
    return ast_utils_1.insertAfterLastOccurrence(allImports, toInsert, fileToEdit, fallbackPos, ts.SyntaxKind.StringLiteral);
}
exports.insertImport = insertImport;
function getDecoratorPropertyValueNode(host, modulePath, identifier, property, module) {
    var moduleSourceText = host.read(modulePath).toString('utf-8');
    var moduleSource = ts.createSourceFile(modulePath, moduleSourceText, ts.ScriptTarget.Latest, true);
    var templateNode = getMatchingProperty(moduleSource, property, identifier, module);
    return templateNode.getChildAt(templateNode.getChildCount() - 1);
}
exports.getDecoratorPropertyValueNode = getDecoratorPropertyValueNode;
function replaceNodeValue(host, modulePath, node, content) {
    insert(host, modulePath, [
        new change_1.ReplaceChange(modulePath, node.pos, node.getFullText(), content)
    ]);
}
exports.replaceNodeValue = replaceNodeValue;
