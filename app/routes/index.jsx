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
      <h1 className='text-3xl text-center py-3'>Terraria Recipes</h1>
      <div className='mx-8 mb-4'>
        <input
          type='search'
          placeholder='Search...'
          className='border border-neutral-400 rounded py-2 px-3 w-full'
          value={text}
          onChange={e => setText(e.target.value)}
        />
        {!!matches.length && (
          <ul className='shadow-md shadow-slate-300 py-2'>
            {matches.map(match => (
              <li
                key={match.name}
                className='px-4 py-2 hover:bg-slate-100 cursor-pointer'
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
        'line-through text-gray-300': completed,
        'border-2 border-emerald-400 inline-block p-4 align-top m-3 relative': remove
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
                className='text-blue-500 text-sm ml-2'
                onClick={() => setShowingModal(a => !a)}
              >
                change
              </button>
              {showingModal && (
                <ul className='flex p-2 shadow-md border border-gray-200 absolute bg-white text-black'>
                  {entries.map((entry, i) => (
                    <li key={i} className='ml-2 first:ml-0'>
                      <button
                        className='border-2 border-emerald-400 p-2 hover:bg-emerald-50 text-left whitespace-nowrap'
                        onClick={() => {
                          setVariant(myPath, i)
                          setShowingModal(false)
                        }}
                      >
                        <div className='font-bold text-sm underline'>
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
            className='px-3 ml-2 text-xl bg-red-400 hover:bg-red-500 active:bg-red-600 text-white rounded absolute top-3 right-3'
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
