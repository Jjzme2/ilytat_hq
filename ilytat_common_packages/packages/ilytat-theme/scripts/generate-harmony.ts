
import { ThemeGenerator } from '../utils/theme-generator'
import type { IlytatTheme } from '../types'

const generator = new ThemeGenerator(12345) // Seed doesn't matter much if we iterate
const themes: IlytatTheme[] = []

for (let i = 0; i < 25; i++) {
    // We use a different seed for each iteration implicitly by just creating new generators or relying on internal state if we didn't reset? 
    // The generator resets state in `generate()`.
    // So we need to pass a new seed each time.
    const seed = 5000 + i
    const gen = new ThemeGenerator(seed)
    const theme = gen.generate({ category: 'harmony' })

    // Customize ID and Name for presets
    theme.id = `harmony-preset-${i + 1}`
    theme.name = `Harmony ${i + 1}`

    themes.push(theme)
}

import { writeFile } from 'fs/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const output = `import type { IlytatTheme } from '../../types'

export const harmonyThemes: IlytatTheme[] = ${JSON.stringify(themes, null, 4)}
`

await writeFile(join(__dirname, '../themes/harmony/index.ts'), output)
console.log('File written successfully')
