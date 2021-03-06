import {
  SchematicTestRunner,
  UnitTestTree,
} from "@angular-devkit/schematics/testing";
import * as fs from "fs";
import {} from "jest";
import * as path from "path";
import { Observable } from "rxjs";
import { mergeMap, tap } from "rxjs/operators";
import {
  createTestRunner,
  createTestWorkspace,
  getFiles,
  getNumberOfFiles,
} from "./test-workspace.functions";

export function testBuildingBlock(dirName: string, buildingBlockName: string) {
  dirName = path.join(dirName, "testing");

  const testNames = getTestNames(dirName);

  testNames.forEach((testName) =>
    runTests(dirName, testName, buildingBlockName)
  );
}

function runTests(
  dirName: string,
  testName: string,
  buildingBlockName: string
) {
  describe(testName, () => {
    let runner: SchematicTestRunner;
    let workspace$: Observable<UnitTestTree>;
    let numberOfWorkspaceFiles: number;

    beforeEach(() => {
      const testOptions = loadTestOptions(dirName, testName);

      runner = createTestRunner(dirName);
      workspace$ = createTestWorkspace(dirName, testName, runner).pipe(
        tap((workspace) => {
          numberOfWorkspaceFiles =
            workspace.files.length -
            getNumberOfFiles(path.join(dirName, testName, "input"));
        }),
        mergeMap((workspace) =>
          runner.runSchematicAsync(buildingBlockName, testOptions, workspace)
        )
      );
    });

    it("should have generated the correct amount of files", (done) => {
      workspace$.subscribe((tree) => {
        expect(
          numberOfWorkspaceFiles +
            getNumberOfFiles(path.join(dirName, testName, "expected"))
        ).toEqual(tree.files.length);

        done();
      });
    });

    describe("files should have the correct content", () => {
      const files = getFiles(path.join(dirName, testName, "expected"));

      files.forEach((file) => {
        it(`should have correct file content for the file: ${file.fileName}`, (done) => {
          workspace$.subscribe((tree) => {
            const treeFilePath = tree.files.find((treeFile) =>
              treeFile.includes(file.fileName)
            );

            if (!treeFilePath) {
              done.fail(`Cannot find a file for: ${file.fileName}`);
            }

            const treeFile = tree.get(treeFilePath);

            if (!treeFile.content) {
              done.fail(`No contents for: ${file.fileName}`);
            }

            const treeFileContents = tree.get(treeFilePath).content.toString();

            expect(normaliseNewLines(treeFileContents)).toEqual(
              normaliseNewLines(file.fileContents)
            );

            done();
          });
        });
      });
    });
  });
}

function normaliseNewLines(input: string) {
  return input.replace(/\r\n|\r/g, "\n");
}

function loadTestOptions(dirName: string, testName: string) {
  const optionsString = fs
    .readFileSync(path.join(dirName, testName, "schema-options.json"))
    .toString();

  return JSON.parse(optionsString);
}

function getTestNames(source: string) {
  return fs
    .readdirSync(source, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
}
