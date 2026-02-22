import type { IlytatTheme } from '../types'

// We will import all themes here
import { glassThemes } from './glass'
import { minimalThemes } from './minimal'
import { cyberpunkThemes } from './cyberpunk'
import { natureThemes } from './nature'
import { abstractThemes } from './abstract'
import { solidThemes } from './solid'
import { gradientThemes } from './gradient'
import { luxuryThemes } from './luxury'
import { harmonyThemes } from './harmony'

import { getPresetThemes } from '../utils/theme-presets'

export const themes: IlytatTheme[] = [
    ...glassThemes,
    ...minimalThemes,
    ...cyberpunkThemes,
    ...natureThemes,
    ...abstractThemes,
    ...solidThemes,
    ...gradientThemes,
    ...luxuryThemes,
    ...harmonyThemes,
    ...getPresetThemes()
]
