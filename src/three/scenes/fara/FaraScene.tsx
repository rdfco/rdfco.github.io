import { ThreeCanvas } from '../../core'
import { backgroundColors } from './background-colors'
import { FaraWorld } from './FaraWorld'

export default function FaraScene() {
  return <ThreeCanvas
    background={backgroundColors.skyDark}
    fog={[backgroundColors.mountainFog, 40, 450]}
  >
    <FaraWorld />
  </ThreeCanvas>
}
