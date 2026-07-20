import { defaultBackgroundColors } from '@/scenes/backgroundColors'

describe('source path alias', () => {
  it('resolves @ to the current src root', () => {
    expect(defaultBackgroundColors.skyDark).toBe('#081219')
  })
})
