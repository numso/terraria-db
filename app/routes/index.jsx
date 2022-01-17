import clsx from 'clsx'
import _ from 'lodash'
import { nanoid } from 'nanoid'
import { useLoaderData } from 'remix'

import recipes from '../../data/recipes.json'

export const loader = () => {
  return recipes
}

const compare = (a, b) => {
  if (!a || !b) return false
  return (
    a.toLowerCase().includes(b.toLowerCase()) ||
    b.toLowerCase().includes(a.toLowerCase())
  )
}

export default function Index () {
  const [text, setText] = React.useState('cell')
  const recipes = useLoaderData()
  const [selected, setSelected] = React.useState([
    {
      id: nanoid(),
      ..._.find(recipes, { name: 'Terraspark Boots' })
    },
    {
      id: nanoid(),
      ..._.find(recipes, { name: 'Cell Phone' })
    }
  ])
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
                  setSelected(a => [...a, { ...match, id: nanoid() }])
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
        {selected.map(item => (
          <Item
            key={item.id}
            recipes={recipes}
            item={item}
            amount={1}
            remove={() => setSelected(a => _.reject(a, { id: item.id }))}
            seen={[]}
          />
        ))}
      </ul>
    </div>
  )
}

function Item ({ item, amount, remove, recipes, seen, parentCompleted }) {
  const [selfCompleted, setCompleted] = React.useState(false)
  const completed = selfCompleted || parentCompleted
  const entries = _.filter(recipes, { name: item.name })
  return (
    <li
      className={clsx('list-disc', {
        'line-through text-gray-300': completed,
        'border-2 border-emerald-400 inline-block p-4 align-top m-3 relative': remove
      })}
    >
      <label className={clsx({ 'pr-10': remove })}>
        <span>
          <input
            type='checkbox'
            className='mr-1'
            checked={completed}
            onChange={e => setCompleted(e.target.checked)}
          />
          <span>{item.name}</span>
          {amount !== 1 && <span> ({amount})</span>}
          {item.workbench && <span> ({item.workbench.join('/')})</span>}
          {entries.length >= 2 && (
            <button className='text-blue-500 text-sm ml-2'>change</button>
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
      </label>
      {item.ingredients && (
        <ul className='pl-4'>
          {item.ingredients.map(ingredient => {
            if (ingredient.name.includes(' Wall')) return null
            if (seen.includes(ingredient.name)) return null
            let thing = _.find(recipes, { name: ingredient.name })
            if (!thing) thing = { name: ingredient.name }
            return (
              <Item
                key={thing.name}
                item={thing}
                amount={ingredient.amount}
                recipes={recipes}
                seen={[...seen, thing.name]}
                parentCompleted={completed}
              />
            )
          })}
        </ul>
      )}
    </li>
  )
}
