import { Rule, Tree, SchematicContext } from '@angular-devkit/schematics';

import { BuildingBlockOptions } from '../../common/models/building-block-options.model';
import { createBuildingBlock } from '../../common/functions/create-building-block.functions';

export default function(options: BuildingBlockOptions): Rule {
  options.modulePropName = 'controllers';
  options.type = 'controller';
  options.folderName = 'controllers';

  return createBuildingBlock(options);
}
