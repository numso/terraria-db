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
  const a = $('a:not(:first-child)', el)
    .map((i, el) => $(el).attr('title'))
    .toArray()
  if (!a.length) return true
  return a.includes('Desktop version')
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
          let item = $('td.result a:first-child', el).text()
          let isDesktop = isDesktopVersion($, el)
          if (!item) [item, isDesktop] = prev
          else prev = [item, isDesktop]

          if (!isDesktop) return null

          const ingredients = $('td.ingredients li', el)
            .map((i, el) => {
              let amount = $('.note-text', el).text() || '(1)'
              amount = +amount.substring(1, amount.length - 1)
              return { item: $('a', el).text(), amount }
            })
            .toArray()
            .filter(Boolean)

          return { workbench, item, ingredients }
        })
        .toArray()
        .filter(Boolean)
    })
    .toArray()

  return recipes
}
