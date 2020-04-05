import { Tree } from '@angular-devkit/schematics/src/tree/interface';
import { SchematicsException } from '@angular-devkit/schematics';
import { parseJson, JsonParseMode } from '@angular-devkit/core';
import {
  WorkspaceSchema,
  WorkspaceProject
} from '@angular-devkit/core/src/experimental/workspace';

export function getProject(tree: Tree, projectName: string) {
  let workspace = getWorkspace(tree);

  return workspace.projects[projectName] as WorkspaceProject;
}

export function getDefaultProject(tree: Tree) {
  let workspace = getWorkspace(tree);

  if (!workspace.defaultProject) {
    throw new SchematicsException('Could not find default project');
  }

  return workspace.projects[workspace.defaultProject] as WorkspaceProject;
}

export function getWorkspace(host: Tree) {
  const path = getWorkspacePath(host);
  const configBuffer = host.read(path);
  if (configBuffer === null) {
    throw new SchematicsException(`Could not find (${path})`);
  }
  const content = configBuffer.toString();

  return (parseJson(content, JsonParseMode.Loose) as {}) as WorkspaceSchema;
}

export function getWorkspacePath(host: Tree): string {
  const possibleFiles = [
    '/angular.json',
    '/.angular.json',
    '/workspace.json',
    '/.workspace.json'
  ];
  const path = possibleFiles.filter(path => host.exists(path))[0];

  return path;
}
