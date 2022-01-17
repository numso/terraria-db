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

  await fs.writeFile(
    path.join(DATA_DIR, 'recipes.json'),
    JSON.stringify(data, null, 2)
  )
}

main()
  .then(() => console.log('Success!!'))
  .catch(console.error)
