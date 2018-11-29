import { ProjectNode, Deps } from './affected-apps';
import * as yargs from 'yargs';
export declare enum NodeEdgeVariant {
    default = "default",
    highlighted = "highlighted"
}
export declare type GraphvizOptions = {
    fontname?: string;
    fontsize?: number;
    shape?: string;
    color?: string;
    style?: string;
    fillcolor?: string;
};
export declare type AttrValue = {
    attr: string;
    value: boolean | number | string;
};
export declare type GraphvizOptionNodeEdge = {
    [key: string]: {
        [variant: string]: GraphvizOptions;
    };
};
export declare type GraphvizConfig = {
    graph: AttrValue[];
    nodes: GraphvizOptionNodeEdge;
    edges: GraphvizOptionNodeEdge;
};
export declare type ProjectMap = {
    [name: string]: ProjectNode;
};
export declare type CriticalPathMap = {
    [name: string]: boolean;
};
export declare enum OutputType {
    'json' = "json",
    'html' = "html",
    'dot' = "dot",
    'svg' = "svg"
}
export interface UserOptions extends yargs.Arguments {
    file?: string;
    output?: string;
}
export declare const graphvizConfig: GraphvizConfig;
export declare function createGraphviz(config: GraphvizConfig, deps: Deps, projects: ProjectNode[], criticalPath: CriticalPathMap): any;
export declare function generateGraph(args: UserOptions, criticalPath?: string[]): void;
