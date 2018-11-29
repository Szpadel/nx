import { YargsAffectedOptions } from './affected';
export interface YargsFormatOptions extends YargsAffectedOptions {
    libsAndApps?: boolean;
}
export declare function format(command: 'check' | 'write', args: YargsFormatOptions): void;
