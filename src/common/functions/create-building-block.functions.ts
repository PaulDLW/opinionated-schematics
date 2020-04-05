import { BuildingBlockOptions } from '../models/building-block-options.model';
import {
  Tree,
  chain,
  noop,
  mergeWith,
  apply,
  url,
  template,
  move
} from '@angular-devkit/schematics';
import * as path from 'path';
import { Path, strings } from '@angular-devkit/core';
import {
  getProject,
  getDefaultProject,
  getWorkspace
} from './project.functions';
import {
  findModule as findModulePath,
  getModuleName,
  addBuildingBlockToModuleFile
} from './module.functions';
import { toPosix as toPosixFileSeparator } from './path-utils.functions';

export function createBuildingBlock(options: BuildingBlockOptions) {
  return () => {
    return chain([
      populateOptions(options),
      addBuildingBlockToModule(options),
      generateFiles(options)
    ]);
  };
}

function populateOptions(options: BuildingBlockOptions) {
  return (tree: Tree) => {
    options.workspace = getWorkspace(tree);

    let project = getProject(tree, options.projectName);

    if (!project) {
      project = getDefaultProject(tree);
    }

    options.project = project;

    options.sourceRoot = project.sourceRoot ?? '';
    options.projectType = project.projectType === 'application' ? 'app' : 'lib';

    options.fullPath = toPosixFileSeparator(
      path.join(
        options.sourceRoot,
        options.projectType,
        options.path,
        options.name
      )
    ) as Path;
    return tree;
  };
}

function addBuildingBlockToModule(options: BuildingBlockOptions) {
  return (tree: Tree) => {
    if (options.modulePropName === null || options.type === 'module') {
      return noop();
    }

    if (!options.moduleName) {
      options.modulePath = findModulePath(tree, options.fullPath);
    } else {
      options.modulePath = path.join(
        options.sourceRoot,
        options.projectType,
        options.path,
        options.moduleName
      );
    }

    if (!options.modulePath) {
      return noop();
    }

    options.moduleName = getModuleName(options.modulePath);

    options.moduleRelativePath = toPosixFileSeparator(
      path.relative(options.fullPath, options.modulePath)
    ).replace('.ts', '');

    tree = addBuildingBlockToModuleFile(tree, options);

    return tree;
  };
}

function generateFiles(options: BuildingBlockOptions) {
  return (tree: Tree) => {
    if (
      options.type === 'module' &&
      tree.exists(path.join(options.fullPath, `${options.name}.module.ts`))
    ) {
      return noop();
    }

    return mergeWith(
      apply(url('./files' as Path), [
        template({
          tmpl: '',
          ...strings,
          ...options
        }),
        move(options.fullPath)
      ])
    );
  };
}
