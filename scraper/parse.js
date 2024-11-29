const cheerio = require('cheerio')

function isDesktopVersion ($, el) {
  const consoles = $('td.result .version-note > a', el)
    .map((i, el) => $(el).attr('title'))
    .toArray()
  return consoles.includes('PC version') || consoles.length === 0
}

module.exports = html => {
  const $ = cheerio.load(html, null, false)

  const recipes = $('table.recipes')
    .map((i, el) => {
      const workbench = $('caption a', el)
        .map((i, el) => $(el).text())
        .toArray()
        .filter(Boolean)

      let prev = []

      return $('tr[data-rowid]', el)
        .map((i, el) => {
          let name = $('td.result a:first-child', el).text()
          let isDesktop = isDesktopVersion($, el)
          if (!name) [name, isDesktop] = prev
          else prev = [name, isDesktop]

          if (!isDesktop) return null

          const ingredients = $('td.ingredients li', el)
            .map((i, el) => {
              let amount = +($('.am', el).text() || '1')
              return { name: $('a', el).text(), amount }
            })
            .toArray()
            .filter(Boolean)

          return { workbench, name, ingredients }
        })
        .toArray()
        .filter(Boolean)
    })
    .toArray()

  return recipes
}
