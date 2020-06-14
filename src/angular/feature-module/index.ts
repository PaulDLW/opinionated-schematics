import { Path } from "@angular-devkit/core";
import {
  branchAndMerge,
  chain,
  Rule,
  schematic,
} from "@angular-devkit/schematics";
import { createBuildingBlock } from "../../common/functions/create-building-block.functions";
import { BuildingBlockOptions } from "../../common/models/building-block-options.model";

export default function(options: BuildingBlockOptions): Rule {
  const moduleOptions = {
    ...options,
    path: `${options.path}/${options.name}` as Path,
    flatFolder: true,
  };

  const featureModuleOptions = {
    ...options,
    path: `${options.path}/${options.name}` as Path,
    name: options.name + "-routing",
    type: "module",
    modulePropName: "imports",
    flatFolder: true,
  };

  const componentOptions = {
    ...options,
    path: `${options.path}/${options.name}/pages` as Path,
    moduleName: "",
    moduleExport: false,
  };

  return branchAndMerge(
    chain([
      schematic("module", moduleOptions),
      schematic("component", componentOptions),
      createBuildingBlock(featureModuleOptions),
    ])
  );
}
