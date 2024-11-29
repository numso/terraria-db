import clsx from 'clsx'
import _ from 'lodash'
import { nanoid } from 'nanoid'
import { useLoaderData } from 'remix'

import recipes from '../../data/recipes.json'

export const loader = ({ request }) => {
  return { recipes, url: request.url }
}

const compare = (a, b) => {
  if (!a || !b) return false
  return (
    a.toLowerCase().includes(b.toLowerCase()) ||
    b.toLowerCase().includes(a.toLowerCase())
  )
}

// function useStorageState (key, defaultValue) {
//   const [value, setValue] = React.useState(() => {
//     try {
//       const raw = localStorage.getItem(key)
//       if (raw === null) throw new Error()
//       return JSON.parse(raw)
//     } catch {
//       return defaultValue
//     }
//   })
//   React.useEffect(() => {
//     localStorage.setItem(key, JSON.stringify(value))
//   }, [value])
//   return [value, setValue]
// }

export default function Index () {
  const [text, setText] = React.useState('')
  const { recipes, url } = useLoaderData()
  const [selected, setSelected] = React.useState(() => {
    try {
      const url2 = new URL(url || window.location.href)
      const raw = url2.searchParams.get('state')
      return JSON.parse(atob(decodeURIComponent(raw)))
    } catch {
      return []
    }
  })
  React.useEffect(() => {
    const str = JSON.stringify(selected)
    const encoded = btoa(str)
    const safe = encodeURIComponent(encoded)
    window.history.replaceState(null, null, `?state=${safe}`)
  }, [selected])
  let matches = recipes.filter(recipe => compare(recipe.name, text))
  matches = _.map(_.groupBy(matches, 'name'), a => a[0])
  if (matches.length > 15) matches.length = 15
  return (
    <div>
      <h1 className='py-3 text-center text-3xl'>Terraria Recipes</h1>
      <div className='mx-8 mb-4'>
        <input
          type='search'
          placeholder='Search...'
          className='border-neutral-400 w-full rounded border px-3 py-2'
          value={text}
          onChange={e => setText(e.target.value)}
        />
        {!!matches.length && (
          <ul className='shadow-slate-300 py-2 shadow-md'>
            {matches.map(match => (
              <li
                key={match.name}
                className='hover:bg-slate-100 cursor-pointer px-4 py-2'
                onClick={() => {
                  setSelected(a => [
                    ...a,
                    {
                      id: nanoid(),
                      name: match.name,
                      completed: {},
                      variants: {}
                    }
                  ])
                  setText('')
                }}
              >
                {match.name}
              </li>
            ))}
          </ul>
        )}
      </div>
      <ul className='pl-8'>
        {selected.map((item, i) => (
          <Item
            key={item.id}
            name={item.name}
            amount={1}
            path={[]}
            recipes={recipes}
            item={item}
            remove={() => setSelected(a => _.reject(a, { id: item.id }))}
            setCompleted={(path, completed) => {
              setSelected(selected => {
                const newSelected = _.cloneDeep(selected)
                newSelected[i].completed[path] = completed
                return newSelected
              })
            }}
            setVariant={(path, variant) => {
              setSelected(selected => {
                const newSelected = _.cloneDeep(selected)
                newSelected[i].variants[path] = variant
                return newSelected
              })
            }}
            seen={[]}
          />
        ))}
      </ul>
    </div>
  )
}

function Item ({
  name,
  path,
  item,
  amount,
  remove,
  recipes,
  seen,
  setCompleted,
  setVariant,
  parentCompleted
}) {
  const myPath = path.join('.')
  const selfCompleted = item.completed[myPath] || false
  const entryIndex = item.variants[myPath] || 0

  const [showingModal, setShowingModal] = React.useState(false)
  const completed = selfCompleted || parentCompleted || false
  const entries = _.filter(recipes, { name })
  const { workbench, ingredients } = entries[entryIndex] || {}
  return (
    <li
      className={clsx('list-disc', {
        'text-gray-300 line-through': completed,
        'border-emerald-400 relative m-3 inline-block border-2 p-4 align-top':
          remove
      })}
    >
      <div className={clsx({ 'pr-10': remove })}>
        <span>
          <input
            type='checkbox'
            className='mr-1'
            checked={completed}
            onChange={e => setCompleted(myPath, e.target.checked)}
          />
          <a
            className='hover:text-blue-500 hover:underline'
            href={`https://terraria.fandom.com/wiki/${name}`}
            target='_blank'
            rel='noreferrer noopener'
          >
            {name}
          </a>
          {amount !== 1 && <span> ({amount})</span>}
          {workbench && <span> ({workbench.join('/')})</span>}
          {entries.length >= 2 && (
            <div className='inline'>
              <button
                className='ml-2 text-sm text-blue-500'
                onClick={() => setShowingModal(a => !a)}
              >
                change
              </button>
              {showingModal && (
                <ul className='border-gray-200 absolute flex border bg-white p-2 text-black shadow-md'>
                  {entries.map((entry, i) => (
                    <li key={i} className='ml-2 first:ml-0'>
                      <button
                        className='border-emerald-400 hover:bg-emerald-50 whitespace-nowrap border-2 p-2 text-left'
                        onClick={() => {
                          setVariant(myPath, i)
                          setShowingModal(false)
                        }}
                      >
                        <div className='text-sm font-bold underline'>
                          {entry.workbench.join('/')}
                        </div>
                        <ul>
                          {entry.ingredients.map(ingredient => (
                            <li key={ingredient.name} className='text-sm'>
                              {ingredient.name}
                            </li>
                          ))}
                        </ul>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </span>
        {remove && (
          <button
            className='active:bg-red-600 absolute right-3 top-3 ml-2 rounded bg-red-400 px-3 text-xl text-white hover:bg-red-500'
            onClick={remove}
          >
            ×
          </button>
        )}
      </div>
      {ingredients && (
        <ul className='pl-4'>
          {ingredients.map((ingredient, i) => {
            if (ingredient.name.includes(' Wall')) return null
            if (seen.includes(ingredient.name)) return null
            return (
              <Item
                key={ingredient.name}
                name={ingredient.name}
                amount={ingredient.amount}
                path={[...path, i]}
                item={item}
                recipes={recipes}
                seen={[...seen, ingredient.name]}
                parentCompleted={completed}
                setCompleted={setCompleted}
                setVariant={setVariant}
              />
            )
          })}
        </ul>
      )}
    </li>
  )
}
