import { virtualFs } from "@angular-devkit/core";
import { HostTree } from "@angular-devkit/schematics";
import {
  SchematicTestRunner,
  UnitTestTree,
} from "@angular-devkit/schematics/testing";
import * as fs from "fs";
import * as path from "path";
import { of } from "rxjs";
import { TestFile } from "./models/test-file.model";

const TEST_FILE_NAME = "__testFile__";

export function createTestRunner(dirName: string) {
  const collectionPath = path.join(dirName, "../../../collection.json");

  return new SchematicTestRunner("schematics", collectionPath);
}

export function createTestWorkspace(
  dirName: string,
  testName: string,
  runner: SchematicTestRunner
) {
  jest.setTimeout(30000);

  const host = new virtualFs.test.TestHost({});

  const tree = new UnitTestTree(new HostTree(host));

  const angularJsonContent = fs
    .readFileSync(
      path.join(dirName, "../../..", "testing", "files", "angular.json")
    )
    .toString();

  tree.create("angular.json", angularJsonContent);

  addInputFilesToTree(tree, path.join(dirName, testName, "input"));

  return of(tree);
}

export function getNumberOfFiles(filesPath: string) {
  if (fs.existsSync(filesPath)) {
    const filePaths = fs.readdirSync(filesPath);

    return filePaths.reduce((count, file) => {
      const fullPath = path.join(filesPath, file);

      if (fs.lstatSync(fullPath).isDirectory()) {
        count += getNumberOfFiles(fullPath);
      } else {
        count += 1;
      }

      return count;
    }, 0);
  } else {
    return 0;
  }
}

export function getFiles(filesPath: string) {
  const filePaths = fs.readdirSync(filesPath);

  return filePaths.reduce((filesArr, file) => {
    const fullPath = path.join(filesPath, file);

    if (fs.lstatSync(fullPath).isDirectory()) {
      filesArr = filesArr.concat(getFiles(fullPath));
    } else {
      filesArr.push({
        fileName: path.basename(fullPath).replace(TEST_FILE_NAME, ""),
        filePath: fullPath.replace(TEST_FILE_NAME, ""),
        fileContents: fs.readFileSync(fullPath).toString(),
      });
    }

    return filesArr;
  }, [] as TestFile[]);
}

function addInputFilesToTree(
  tree: UnitTestTree,
  dirName: string,
  rootDir: string = null
) {
  if (rootDir === null) {
    rootDir = dirName;
  }

  if (fs.existsSync(dirName)) {
    const files = fs.readdirSync(dirName);

    files.forEach((filePath) => {
      const fullFilePath = path.join(dirName, filePath);

      if (!fs.lstatSync(fullFilePath).isDirectory()) {
        const fileContents = fs.readFileSync(fullFilePath).toString();

        const relativePath = fullFilePath.replace(rootDir + path.sep, "");

        tree.create(
          path.join("src", "app", relativePath.replace(TEST_FILE_NAME, "")),
          fileContents
        );
      } else {
        addInputFilesToTree(tree, fullFilePath, rootDir);
      }
    });
  }
}
