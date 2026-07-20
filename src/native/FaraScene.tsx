import { FaraLegacyScene } from '../scenes/fara/FaraLegacyScene'
import { backgroundColors } from '../scenes/backgroundColors'
import { ThreeCanvas } from '../three'

export default function FaraScene() {
  return <ThreeCanvas
    background={backgroundColors.skyDark}
    fog={[backgroundColors.mountainFog, 40, 450]}
  >
    <FaraLegacyScene />
  </ThreeCanvas>
}
