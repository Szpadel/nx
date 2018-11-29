import { ProjectNode } from './affected-apps';
export interface ErrorGroup {
    header: string;
    errors: string[];
}
export declare class WorkspaceIntegrityChecks {
    private projectNodes;
    private files;
    private packageJson;
    constructor(projectNodes: ProjectNode[], files: string[], packageJson: any);
    run(): ErrorGroup[];
    private packageJsonConsistencyCheck;
    private projectWithoutFilesCheck;
    private filesWithoutProjects;
    private allProjectFiles;
}
