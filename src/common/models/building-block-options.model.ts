import { Path } from '@angular-devkit/core';
import {
  WorkspaceSchema,
  WorkspaceProject
} from '@angular-devkit/core/src/experimental/workspace';

export interface BuildingBlockOptions {
  workspace: WorkspaceSchema;
  project: WorkspaceProject;
  projectName: string;
  projectType: string;
  sourceRoot: string;
  path: Path;
  fileName: string;
  name: string;
  fullPath: Path;
  moduleExport: boolean;
  modulePath?: string;
  moduleFilePath?: string;
  moduleName?: string;
  modulePropName?: string;
  moduleRelativePath?: string;
  type?: string;
  folderName?: string;
  //   tags?: string;
  //   parsedTags: string[];
  //   appProjectRoot?: string;
}
