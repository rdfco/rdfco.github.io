import type { AssetDefinition } from '../types/content'
export const assetRegistry = {
  heroModel:{path:'/assets/models/fort-energy/fort-energy.glb',kind:'model',preload:true,ownership:'legacy-audit-required'},
  energyChapter:{path:'/assets/models/fort-energy/energy-chapter.glb',kind:'model',preload:false,ownership:'legacy-audit-required'},
  mountains:{path:'/assets/models/mountains.glb',kind:'model',preload:true,ownership:'legacy-audit-required'},
  environment:{path:'/assets/textures/envmap-min.exr',kind:'environment',preload:true,ownership:'legacy-audit-required'},
} satisfies Record<string,AssetDefinition>
