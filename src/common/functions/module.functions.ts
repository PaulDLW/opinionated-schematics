import { strings } from "@angular-devkit/core";
import { Tree } from "@angular-devkit/schematics";
import * as path from "path";
import { BuildingBlockOptions } from "../models/building-block-options.model";
import { toPosix } from "./path-utils.functions";
import { prettier } from "./prettier.functions";

export function findModule(tree: Tree, fullPath: string): string {
  const dir = tree.getDir(fullPath);

  const files = dir.subfiles;

  const moduleStr = files.find(
    (file) => file.includes("module.ts") && !file.includes("rout")
  );

  if (!!moduleStr) {
    return toPosix(path.join(dir.path, moduleStr).substring(1));
  }

  const parentDir = dir.parent;

  if (parentDir === null) {
    return "";
  }

  return findModule(tree, parentDir.path);
}

export function getModuleName(filePath: string) {
  const baseNameSplit = path.basename(filePath).split(".");

  return strings.classify(baseNameSplit[0]);
}

export function addBuildingBlockToModuleFile(
  tree: Tree,
  options: BuildingBlockOptions
) {
  if (!!options.modulePath) {
    let content = tree.read(options.modulePath)?.toString();

    if (!!content) {
      const relativePath = toPosix(
        path.relative(
          options.modulePath.replace(
            `${options.moduleName?.toLocaleLowerCase()}.module.ts`,
            ""
          ),
          options.fullPath
        )
      );

      content = insertImportStatement(content, relativePath, options);
      content = insertBuildingBlockToModule(content, options);

      if (options.moduleExport) {
        content = insertBuildingBlockToModuleExports(content, options);
      }

      tree.overwrite(options.modulePath, prettier.format(content));
    }
  }

  return tree;
}

function insertImportStatement(
  content: string,
  relativePath: string,
  options: BuildingBlockOptions
) {
  let contentSplit = content.split("\n");

  const importLines = contentSplit.reduce((importLines, line, index) => {
    if (new RegExp(/from '.*';/).test(line)) {
      importLines.push(index);
    }

    return importLines;
  }, [] as number[]);

  const lineToAddImport = importLines[importLines.length - 1] + 1;

  console.log("relativePath: ", relativePath);

  const importFilePath = `${
    relativePath.startsWith("..") ? "" : "./"
  }${relativePath}${!!relativePath ? "/" : ""}${options.name}.${options.type}`;

  const importStatement = `import { ${strings.classify(
    options.name + "-" + options.type
  )} } from '${importFilePath}';`;

  contentSplit.splice(lineToAddImport, 0, importStatement);

  return contentSplit.join("\n");
}

function insertBuildingBlockToModule(
  content: string,
  options: BuildingBlockOptions
) {
  const buildingBlockName = strings.classify(options.name + "-" + options.type);
  return insertBuildingBlock(
    content,
    buildingBlockName,
    options.modulePropName
  );
}

function insertBuildingBlockToModuleExports(
  content: string,
  options: BuildingBlockOptions
) {
  const buildingBlockName = strings.classify(options.name + "-" + options.type);
  return insertBuildingBlock(content, buildingBlockName, "exports");
}

function insertBuildingBlock(
  content: string,
  buildingBlockName: string,
  modulePropName?: string
) {
  if (!modulePropName) {
    return content;
  }

  const startSplitCharIndex = content.indexOf("Module(") + 8;
  const endSplitCharIndex = content.lastIndexOf(")") - 1;

  const moduleContent = content.substring(
    startSplitCharIndex,
    endSplitCharIndex
  );

  let props = moduleContent.split(/(?<=\])/g);

  if (props.some((prop) => prop.includes(modulePropName))) {
    props = props.map((prop) => {
      if (isNullOrWhiteSpace(prop)) {
        return "";
      }

      let [key, values] = prop.split(":");

      let valuesJoined = "";

      if (key.includes(modulePropName)) {
        const valuesSplit = values
          .replace(" [", "")
          .replace("]", "")
          .split(", ");

        const valuesSplitFiltered = valuesSplit.reduce((array, value) => {
          if (!isNullOrWhiteSpace(value)) {
            array.push(value);
          }

          return array;
        }, [] as string[]);

        valuesSplitFiltered.push(buildingBlockName);

        valuesJoined = valuesSplitFiltered.join(", ");

        return `${key}: [${valuesJoined}]`;
      } else {
        return prop;
      }
    });
  } else {
    const insertIndex = getInsertIndex(props);

    props.splice(
      insertIndex,
      0,
      `, ${modulePropName ?? ""}: [${buildingBlockName}]`
    );
  }

  return content.replace(moduleContent, props.join(""));
}

function getInsertIndex(props: string[]) {
  if (props.some((prop) => prop.includes("bootstrap"))) {
    return props.length - 1;
  } else {
    return props.length;
  }
}

function isNullOrWhiteSpace(value: string) {
  if (value == null) {
    return true;
  }

  return value.replace(/\s/g, "").length == 0;
}
