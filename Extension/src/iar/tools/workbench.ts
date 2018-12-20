
'use strict';

import * as Fs from "fs";
import * as Path from "path";
import { FsUtils } from "../../utils/fs";

export interface Workbench {
    readonly path: Fs.PathLike;
    readonly idePath: Fs.PathLike;
}

class IarWorkbench {
    readonly path: Fs.PathLike
    readonly idePath: Fs.PathLike

    /**
     * Create a new Workbench object based using a path.
     * 
     * @param path The root path of the workbench. The folders *common* and
     *             *install-info* reside in the root folder.
     */
    constructor(path: Fs.PathLike) {
        this.path = path;
        this.idePath = Path.join(this.path.toString(), "common/bin/IarIdePm.exe");

        if (!this.isValidWorkbench()) {
            throw new Error("Path does not point to a workspace!");
        }
    }

    /**
     * Check if the workbench is valid. This means the IAR IDE is available.
     */
    protected isValidWorkbench(): boolean {
        try {
            let stat = Fs.statSync(this.idePath);

            return stat.isFile();
        } catch (e) {
            return false;
        }
    }
}

export namespace Workbench {
    /**
     * Search for valid workbenches. The found workbenches are stored in the
     * Workbench class and are accessible using the static accessor functions.
     * 
     * @param root The root folder where we must search for valid workbench
     *             paths. By default this is `C:\Program Files (x86)\IAR Systems`.
     * 
     * @returns {Workbench[]} A list of found workbenches. Size can be 0.
     */
    export function collectWorkbenchesFrom(root: Fs.PathLike): Workbench[] {
        let workbenches = new Array<Workbench>();

        let filter = FsUtils.createNonFilteredListDirectory();

        let directories = FsUtils.filteredListDirectory(root, filter);

        directories.forEach(directory => {
            let workbench = create(directory);

            if (workbench !== undefined) {
                workbenches.push(workbench);
            }
        });

        return workbenches;
    }

    /**
     * Get all available workbenches
     * 
     * @returns ReadonlyArray<Workbench>
     */
    export function getWorkbenches(): ReadonlyArray<Workbench> {
        return Array.from(workbenches.values());
    }


    /**
     * Create a new Workbench object and verify it.
     * 
     * @param root the root path of the Workbench. See the constructor help for
     *             more information about this path.
     * 
     * @returns undefined when the specified path is not the root of a valid
     *                    workbench path.
     * @returns Workbench when the specified path is a valid workbench path.
     */
    function create(root: Fs.PathLike): Workbench | undefined {
        try {
            return new IarWorkbench(root);
        } catch (e) {
            return undefined;
        }
    }
}
