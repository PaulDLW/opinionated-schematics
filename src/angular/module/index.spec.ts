import {} from 'jest';
import { testBuildingBlock } from '../../testing/test-building-block.functions';

let buildingBlockName = 'module';

describe(buildingBlockName, () => {
  testBuildingBlock(__dirname, buildingBlockName);
});
