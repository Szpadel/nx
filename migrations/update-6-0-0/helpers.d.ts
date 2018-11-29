import * as ts from 'typescript';
export declare function findFunctionCallExpressionStatement(nodes: ts.Node[], functionName: string): ts.ExpressionStatement;
export declare function findFunctionCalls(sourceFile: ts.SourceFile, functionName: string): ts.VariableStatement[];
export declare function findRequireStatement(nodes: ts.Node[]): ts.VariableStatement;
export declare function findSpecDeclaration(nodes: ts.Node[]): ts.PropertyAssignment;
export declare function findTsNodeRegisterExpression(nodes: ts.Node[]): ts.CallExpression;
