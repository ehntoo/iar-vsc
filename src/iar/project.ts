'use strict';

import * as fs from 'fs';
import * as xmljs from 'xml-js';
import * as mPath from 'path';
import * as iar_errors from './errors';
import * as iar_config from './config';
import { XmlNode } from './XmlNode';

export class Project {
    private projectFile: fs.PathLike;
    private rootElement?: XmlNode;

    constructor(projectFile: fs.PathLike) {
        this.projectFile = projectFile;
    }

    /**
     * replaceIarProjDirInPaths
     */
    public replaceIarProjDirInPaths(paths: string[]): string[] {
        let newPaths: string[] = [];

        paths.forEach(path => {
            newPaths.push(this.replaceIarProjDirInPath(path));
        });

        return newPaths;
    }


    /**
     * replaceIarProjDirInPath
     */
    public replaceIarProjDirInPath(path: string): string {
        let projectFolder = mPath.dirname(this.projectFile.toString());

        return path.replace("$PROJ_DIR$", projectFolder);
    }


    /**
     * Parse
     */
    public parse(): Error | undefined {
        let fd = fs.openSync(this.projectFile, "r");

        let fstat = fs.fstatSync(fd);

        if (!fstat.isFile()) {
            return new Error(iar_errors.sErrorFileNotFound);
        }

        let content = Buffer.alloc(fstat.size);
        let bytesRead = fs.readSync(fd, content, 0, fstat.size, 0);
        fs.closeSync(fd);

        if (bytesRead === 0) {
            return new Error(iar_errors.sErrorReadingFile);
        }

        let xmldoc = xmljs.xml2js(content.toString(), { compact: false }) as xmljs.Element;

        if (xmldoc.elements) {
            let root = xmldoc.elements[0];

            if(root.name === 'project') {
                this.rootElement = new XmlNode(root);
            }
            else
            {
                return new Error(iar_errors.sErrorNotAnIarProjectFile);
            }
        }
        else
        {
            return new Error(iar_errors.sErrorNotAnXmlFile);
        }

        return undefined;
    }

    public getConfigs(): iar_config.Config[] {
        let configs: iar_config.Config[] = [];

        if(this.rootElement) {
            let children = this.rootElement.getAllChildsByName('configuration');

            children.forEach(child => {
                configs.push(new iar_config.Config(this, child));
            });
        }

        return configs;
    }
}