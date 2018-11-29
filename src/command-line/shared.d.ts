import { AffectedFetcher, Dependency, DepGraph, ProjectNode } from './affected-apps';
import { YargsAffectedOptions } from './affected';
export declare type ImplicitDependencyEntry = {
    [key: string]: string[];
};
export declare type ImplicitDependencies = {
    files: ImplicitDependencyEntry;
    projects: ImplicitDependencyEntry;
};
export declare function parseFiles(options: YargsAffectedOptions): {
    files: string[];
};
export declare function getImplicitDependencies(angularJson: any, nxJson: any): ImplicitDependencies;
export declare function assertWorkspaceValidity(angularJson: any, nxJson: any): void;
export declare function getProjectNodes(angularJson: any, nxJson: any): ProjectNode[];
export declare function readAngularJson(): any;
export declare function readNxJson(): any;
export declare const getAffected: (affectedNamesFetcher: AffectedFetcher) => (touchedFiles: string[]) => string[];
export declare function getAffectedProjectsWithTarget(target: string): (touchedFiles: string[]) => string[];
export declare const getAffectedApps: (touchedFiles: string[]) => string[];
export declare const getAffectedProjects: (touchedFiles: string[]) => string[];
export declare const getAffectedLibs: (touchedFiles: string[]) => string[];
export declare function getTouchedProjects(touchedFiles: string[]): string[];
export declare function getAllAppNames(): string[];
export declare function getAllLibNames(): string[];
export declare function getAllProjectNamesWithTarget(target: string): string[];
export declare function getAllProjectNames(): string[];
export declare function getProjectRoots(projectNames: string[]): string[];
export declare function allFilesInDir(dirName: string): string[];
export declare function readDependencies(npmScope: string, projectNodes: ProjectNode[]): {
    [projectName: string]: Dependency[];
};
export declare function readDepGraph(): DepGraph;
export declare function lastModifiedAmongProjectFiles(): number;
export declare function normalizedProjectRoot(p: ProjectNode): string;
