
import * as Vscode from 'vscode';
import { CommandUtils } from '../../utils/utils';

export class IarExecution extends Vscode.ProcessExecution {
    constructor(process: string, args?: string[], options?: Vscode.ProcessExecutionOptions) {
        if (args !== undefined) {
            super(process, args, options);
        } else {
            super(process, options);
        }

        this.process =  CommandUtils.parseSettingCommands(process);
    }
}