import { ImplicitDependencies } from './shared';
export declare enum ProjectType {
    app = "app",
    e2e = "e2e",
    lib = "lib"
}
export declare enum DependencyType {
    es6Import = "es6Import",
    loadChildren = "loadChildren",
    implicit = "implicit"
}
export declare type ProjectNode = {
    name: string;
    root: string;
    type: ProjectType;
    tags: string[];
    files: string[];
    architect: {
        [k: string]: any;
    };
    implicitDependencies: string[];
};
export declare type Dependency = {
    projectName: string;
    type: DependencyType;
};
export declare type DepGraph = {
    projects: ProjectNode[];
    deps: {
        [projectName: string]: Dependency[];
    };
    npmScope: string;
};
export declare function touchedProjects(implicitDependencies: ImplicitDependencies, projects: ProjectNode[], touchedFiles: string[]): string[];
export declare type AffectedFetcher = (npmScope: string, projects: ProjectNode[], implicitDependencies: ImplicitDependencies, fileRead: (s: string) => string, touchedFiles: string[]) => string[];
export declare function affectedAppNames(npmScope: string, projects: ProjectNode[], implicitDependencies: ImplicitDependencies, fileRead: (s: string) => string, touchedFiles: string[]): string[];
export declare function affectedLibNames(npmScope: string, projects: ProjectNode[], implicitDependencies: ImplicitDependencies, fileRead: (s: string) => string, touchedFiles: string[]): string[];
export declare function affectedProjectNames(npmScope: string, projects: ProjectNode[], implicitDependencies: ImplicitDependencies, fileRead: (s: string) => string, touchedFiles: string[]): string[];
export declare function affectedProjectNamesWithTarget(target: string): AffectedFetcher;
export declare type Deps = {
    [projectName: string]: Dependency[];
};
export declare function dependencies(npmScope: string, projects: ProjectNode[], fileRead: (s: string) => string): Deps;
