const cheerio = require('cheerio')
const fs = require('fs/promises')
const path = require('path')

const parse = require('./parse')

const RAW_DIR = path.join(__dirname, '..', 'raw')
const DATA_DIR = path.join(__dirname, '..', 'data')

async function main () {
  await fs.rm(DATA_DIR, { recursive: true, force: true })
  await fs.mkdir(DATA_DIR)
  const files = await fs.readdir(RAW_DIR)

  const promises = files
    .map(file => {
      if (file.startsWith('_') || !file.endsWith('.html')) return
      return fs.readFile(path.join(RAW_DIR, file), 'utf-8')
    })
    .filter(Boolean)

  const htmls = await Promise.all(promises)
  const data = htmls.flatMap(parse)

  data.forEach(a => {
    a.workbench.sort((a, b) => (a < b ? -1 : 1))
    a.ingredients.sort((a, b) => (a.name < b.name ? -1 : 1))
  })
  
  data.sort((a, b) => {
    if (a.name !== b.name) return a.name < b.name ? -1 : 1
  
    if (a.workbench.join(' ') !== b.workbench.join(' ')) {
      return a.workbench.join(' ') < b.workbench.join(' ') ? -1 : 1
    }
  
    return a.ingredients.map(i => i.name).join(' ') < b.ingredients.map(i => i.name).join(' ')
      ? -1
      : 1
  })

  await fs.writeFile(
    path.join(DATA_DIR, 'recipes.json'),
    JSON.stringify(data, null, 2)
  )
}

main()
  .then(() => console.log('Success!!'))
  .catch(console.error)
