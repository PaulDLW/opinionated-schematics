import {} from 'jest';
import { testBuildingBlock } from '../../testing/test-building-block.functions';

let buildingBlockName = 'nest-controller';

describe(buildingBlockName, () => {
  testBuildingBlock(__dirname, buildingBlockName);
});
