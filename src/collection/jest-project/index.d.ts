import { Rule } from '@angular-devkit/schematics';
export interface JestProjectSchema {
    project: string;
    skipSetupFile: boolean;
}
export default function (options: JestProjectSchema): Rule;
