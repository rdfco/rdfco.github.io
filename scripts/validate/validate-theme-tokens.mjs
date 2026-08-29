import { readdir, readFile } from 'node:fs/promises'

const tokenFile = 'src/config/theme/color-tokens.css'
const colourLiteral = /#[0-9a-fA-F]{3,8}\b|\brgba?\(\s*\d/g

const collect = async (directory, extensions, found = []) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = `${directory}/${entry.name}`
    if (entry.isDirectory()) await collect(path, extensions, found)
    else if (extensions.some(extension => entry.name.endsWith(extension))) found.push(path)
  }
  return found
}

const stylesheets = (await collect('src', ['.css'])).sort()
const declared = new Set()
for (const [, name] of (await readFile(tokenFile, 'utf8')).matchAll(/(--fara-[a-z0-9-]+)\s*:/g)) declared.add(name)

// Some custom properties are written by the runtime rather than declared in CSS.
for (const file of await collect('src', ['.js', '.jsx', '.ts', '.tsx'])) {
  const source = await readFile(file, 'utf8')
  for (const [, name] of source.matchAll(/setProperty\(\s*['"`](--fara-[a-z0-9-]+)['"`]/g)) declared.add(name)
}

const violations = []
for (const file of stylesheets) {
  if (file === tokenFile) continue
  const source = (await readFile(file, 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '')
  for (const [literal] of source.matchAll(colourLiteral)) {
    violations.push(`${file}: raw colour ${literal} - declare it in ${tokenFile} and reference the token`)
  }
  for (const [, name] of source.matchAll(/var\((--fara-[a-z0-9-]+)\)/g)) {
    if (!declared.has(name) && !source.includes(`${name}:`)) violations.push(`${file}: undeclared token ${name}`)
  }
}

if (violations.length) throw new Error(`Theme token validation failed:\n- ${violations.join('\n- ')}`)
console.log(
  `Theme tokens valid: ${declared.size} tokens, ${stylesheets.length - 1} stylesheets free of raw colour literals.`,
)
