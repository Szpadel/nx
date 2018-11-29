"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ts = require("typescript");
function findFunctionCallExpressionStatement(nodes, functionName) {
    return nodes.find(function (node) {
        return ts.isExpressionStatement(node) &&
            ts.isCallExpression(node.expression) &&
            ts.isIdentifier(node.expression.expression) &&
            node.expression.expression.escapedText === functionName;
    });
}
exports.findFunctionCallExpressionStatement = findFunctionCallExpressionStatement;
function findFunctionCalls(sourceFile, functionName) {
    return sourceFile.statements.filter(function (statement) {
        if (!ts.isVariableStatement(statement)) {
            return false;
        }
        var declarations = statement.declarationList.declarations;
        return declarations.some(function (declaration) {
            if (!ts.isCallExpression(declaration.initializer) ||
                !ts.isIdentifier(declaration.initializer.expression)) {
                return false;
            }
            return declaration.initializer.expression.text === functionName;
        });
    });
}
exports.findFunctionCalls = findFunctionCalls;
function findRequireStatement(nodes) {
    return nodes.find(function (node) {
        if (!ts.isVariableStatement(node)) {
            return false;
        }
        var requireDeclaration = node.declarationList.declarations.find(function (declaration) {
            if (!ts.isCallExpression(declaration.initializer)) {
                return false;
            }
            var callExpression = declaration.initializer;
            if (ts.isIdentifier(callExpression.expression) &&
                callExpression.expression.escapedText === 'require' &&
                ts.isStringLiteral(callExpression.arguments[0])) {
                var argument = callExpression.arguments[0];
                return (argument.text === '@nrwl/schematics/src/utils/cli-config-utils');
            }
            return false;
        });
        return !!requireDeclaration;
    });
}
exports.findRequireStatement = findRequireStatement;
function findSpecDeclaration(nodes) {
    return nodes.find(function (node) {
        return ts.isPropertyAssignment(node) &&
            ts.isIdentifier(node.name) &&
            node.name.text === 'specs' &&
            ts.isArrayLiteralExpression(node.initializer);
    });
}
exports.findSpecDeclaration = findSpecDeclaration;
function findTsNodeRegisterExpression(nodes) {
    return nodes.find(function (node) {
        return ts.isCallExpression(node) &&
            ts.isPropertyAccessExpression(node.expression) &&
            ts.isIdentifier(node.expression.name) &&
            node.expression.name.text === 'register' &&
            ts.isCallExpression(node.expression.expression) &&
            ts.isIdentifier(node.expression.expression.expression) &&
            node.expression.expression.expression.text === 'require' &&
            ts.isStringLiteral(node.expression.expression.arguments[0]) &&
            node.expression.expression.arguments[0].text ===
                'ts-node';
    });
}
exports.findTsNodeRegisterExpression = findTsNodeRegisterExpression;
