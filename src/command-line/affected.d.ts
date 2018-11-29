import { GlobalNxArgs } from './nx';
import * as yargs from 'yargs';
export interface YargsAffectedOptions extends yargs.Arguments, AffectedOptions {
}
export interface AffectedOptions extends GlobalNxArgs {
    target?: string;
    parallel?: boolean;
    maxParallel?: number;
    untracked?: boolean;
    uncommitted?: boolean;
    all?: boolean;
    base?: string;
    head?: string;
    exclude?: string[];
    files?: string[];
    onlyFailed?: boolean;
    'only-failed'?: boolean;
    'max-parallel'?: boolean;
}
export declare function affected(parsedArgs: YargsAffectedOptions): void;
