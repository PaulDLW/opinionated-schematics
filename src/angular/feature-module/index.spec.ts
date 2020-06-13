import {} from "jest";
import { testBuildingBlock } from "../../testing/test-building-block.functions";

let buildingBlockName = "feature-module";

describe(buildingBlockName, () => {
  testBuildingBlock(__dirname, buildingBlockName);
});
