export declare class WorkspaceResults {
    private command;
    private startedWithFailedProjects;
    private commandResults;
    private readonly failedProjects;
    readonly hasFailure: boolean;
    constructor(command: string);
    getResult(projectName: string): boolean;
    fail(projectName: string): void;
    success(projectName: string): void;
    saveResults(): void;
    printResults(onlyFailed: boolean, successMessage: string, failureMessage: string): void;
    private setResult;
}
