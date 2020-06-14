import { Path, strings } from "@angular-devkit/core";
import {
  apply,
  branchAndMerge,
  chain,
  mergeWith,
  move,
  noop,
  template,
  Tree,
  url,
} from "@angular-devkit/schematics";
import * as path from "path";
import { BuildingBlockOptions } from "../models/building-block-options.model";
import {
  addBuildingBlockToModuleFile,
  findModule as findModulePath,
  getModuleName,
} from "./module.functions";
import { toPosixFileSeparator } from "./path-utils.functions";
import {
  getDefaultProject,
  getProject,
  getWorkspace,
} from "./project.functions";

export function createBuildingBlock(options: BuildingBlockOptions) {
  return () => {
    return chain([
      populateOptions(options),
      addBuildingBlockToModule(options),
      generateFiles(options),
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

    options.sourceRoot = project.sourceRoot ?? "";
    options.projectType = project.projectType === "application" ? "app" : "lib";

    if (!options.flatFolder) {
      options.fullPath = toPosixFileSeparator(
        path.join(
          options.sourceRoot,
          options.projectType,
          options.path,
          options.name
        )
      ) as Path;
    } else {
      options.fullPath = toPosixFileSeparator(
        path.join(options.sourceRoot, options.projectType, options.path)
      ) as Path;
    }
    return tree;
  };
}

function addBuildingBlockToModule(options: BuildingBlockOptions) {
  return (tree: Tree) => {
    if (!options.modulePropName) {
      return noop();
    }

    if (!options.moduleName) {
      options.modulePath = findModulePath(tree, options.fullPath);
    } else {
      options.modulePath = toPosixFileSeparator(
        path.join(
          options.sourceRoot,
          options.projectType,
          options.path,
          options.moduleName
        )
      );
    }

    if (!options.modulePath) {
      return noop();
    }

    options.moduleName = getModuleName(options.modulePath);

    options.moduleRelativePath = toPosixFileSeparator(
      path.relative(options.fullPath, options.modulePath)
    ).replace(".ts", "");

    tree = addBuildingBlockToModuleFile(tree, options);

    return tree;
  };
}

function generateFiles(options: BuildingBlockOptions) {
  return (tree: Tree) => {
    if (
      options.type === "module" &&
      tree.exists(path.join(options.fullPath, `${options.name}.module.ts`))
    ) {
      return noop();
    }

    const templateSource = apply(url("./files" as Path), [
      template({
        tmpl: "",
        ...strings,
        ...options,
      }),
      move(options.fullPath),
    ]);

    return chain([branchAndMerge(chain([mergeWith(templateSource)]))]);
  };
}
