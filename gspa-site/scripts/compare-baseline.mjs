import { readFile } from 'node:fs/promises'

const baselinePath = process.env.BASELINE_JSON || 'work/baseline/metrics.json'
const candidatePath = process.env.CANDIDATE_JSON || 'work/after/metrics.json'
const baseline = JSON.parse(await readFile(baselinePath, 'utf8'))
const candidate = JSON.parse(await readFile(candidatePath, 'utf8'))
const differences = []

for (const viewport of Object.keys(baseline)) {
  const before = baseline[viewport]
  const after = candidate[viewport]
  if (!after) {
    differences.push(`${viewport}: missing candidate result`)
    continue
  }
  if (before.title !== after.title) differences.push(`${viewport}: document title changed`)
  if (before.bodyText !== after.bodyText) differences.push(`${viewport}: visible text changed`)
  if (before.scrollHeight !== after.scrollHeight) differences.push(`${viewport}: scrollHeight ${before.scrollHeight} -> ${after.scrollHeight}`)
  if (before.horizontalOverflow !== after.horizontalOverflow) differences.push(`${viewport}: horizontal overflow changed`)
  if (JSON.stringify(before.counts) !== JSON.stringify(after.counts)) differences.push(`${viewport}: rendered item counts changed`)
  for (const selectorName of Object.keys(before.boxes)) {
    const oldBox = before.boxes[selectorName]
    const newBox = after.boxes[selectorName]
    if (JSON.stringify(oldBox) !== JSON.stringify(newBox)) {
      differences.push(`${viewport}.${selectorName}: layout/computed style changed`)
    }
  }
  if (after.errors.length) differences.push(`${viewport}: browser errors: ${after.errors.join(' | ')}`)
}

if (differences.length) {
  console.error(`Visual contract failed:\n- ${differences.join('\n- ')}`)
  process.exit(1)
}
console.log('Visual contract passed: text, counts, layout boxes, computed styles, and page dimensions match the baseline.')
