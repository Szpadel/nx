import { Rule } from '@angular-devkit/schematics';
import { Schema } from '../application/schema';
export interface CypressProjectSchema extends Schema {
    appProjectRoot: string;
    e2eProjectName: string;
    e2eProjectRoot: string;
}
export default function (options: CypressProjectSchema): Rule;
