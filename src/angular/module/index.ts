import { Rule } from '@angular-devkit/schematics';

import { BuildingBlockOptions } from '../../common/models/building-block-options.model';
import { createBuildingBlock } from '../../common/functions/create-building-block.functions';

export default function(options: BuildingBlockOptions): Rule {
  options.type = 'module';

  return createBuildingBlock(options);
}
