const axios = require('axios')
const cheerio = require('cheerio')
const fs = require('fs/promises')
const path = require('path')

const RAW_DIR = path.join(__dirname, '..', 'raw')
const LIST_URL = 'https://terraria.fandom.com/wiki/Recipes'
const DETAIL_URL = type =>
  `https://terraria.fandom.com/index.php?action=render&title=${encodeURIComponent(
    type
  )}`

async function main () {
  await fs.rm(RAW_DIR, { recursive: true, force: true })
  await fs.mkdir(RAW_DIR)
  const res = await axios.get(LIST_URL)
  await write('_index', res.data)
  const $ = cheerio.load(res.data)
  const pages = $('table.terraria.ajax')
    .map((i, el) => $(el).attr('data-ajax-source-page'))
    .toArray()

  for (const page of pages) {
    const res = await axios.get(DETAIL_URL(page))
    const file = page
      .toLowerCase()
      .replace('recipes/', '')
      .replace(' ', '-')
    await write(file, res.data)
  }
}

function write (filename, data) {
  return fs.writeFile(path.join(RAW_DIR, `${filename}.html`), data)
}

main()
  .then(() => console.log('Success!!'))
  .catch(console.error)
