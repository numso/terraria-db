const cheerio = require('cheerio')

function isDesktopVersion ($, el) {
  const consoles = $('td.result .eico', el).attr('title')
  const consoles2 = $('td.result a:not(:first-child)', el)
    .map((i, el) => $(el).attr('title'))
    .toArray()

  if (consoles && consoles2.length) {
    throw new Error('Unexpected double console text')
  }

  if (consoles) return consoles.includes('Desktop')
  if (!consoles2.length) return true
  return consoles2.includes('Desktop version')
}

module.exports = html => {
  const $ = cheerio.load(html, null, false)

  const recipes = $('table.crafts')
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
              let amount = $('.note-text', el).text() || '(1)'
              amount = +amount.substring(1, amount.length - 1)
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
