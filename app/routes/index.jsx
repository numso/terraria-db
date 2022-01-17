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
  const [text, setText] = React.useState('')
  const [selected, setSelected] = React.useState([])
  const recipes = useLoaderData()
  const matches = recipes.filter(recipe => compare(recipe.item, text))
  if (matches.length > 15) matches.length = 15
  return (
    <div>
      <h1>Terraria Recipes</h1>
      <label>Search</label>
      <input
        type='search'
        className='border border-neutral-400 rounded py-2 px-3'
        value={text}
        onChange={e => setText(e.target.value)}
      />
      {!!matches.length && (
        <ul className='border'>
          {matches.map(match => (
            <li
              onClick={() =>
                setSelected(a => [...a, { ...match, id: nanoid() }])
              }
            >
              {match.item}
            </li>
          ))}
        </ul>
      )}
      <h1>Selected</h1>
      <ul>
        {selected.map(item => (
          <Item
            recipes={recipes}
            item={item}
            amount={1}
            remove={() => {
              setSelected(a => _.filter(a, a => a.id !== item.id))
            }}
          />
        ))}
      </ul>
    </div>
  )
}

function Item ({ item, amount, remove, recipes }) {
  return (
    <li key={item.id} className='pl-3 ml-3 list-disc'>
      <label>
        <span>
          {item.item} (made at {item.workbench.join('/')})
        </span>
        {remove && (
          <button className='border px-3 py-2 ml-2' onClick={remove}>
            X
          </button>
        )}
      </label>
      <ul>
        {item.ingredients.map(ingredient => {
          const thing = _.find(recipes, { item: ingredient.item })
          if (thing) {
            return (
              <Item item={thing} amount={ingredient.amount} recipes={recipes} />
            )
          }
          return (
            <li className='pl-3 ml-3 list-disc'>
              {ingredient.item}
              {ingredient.amount !== 1 && ` (${ingredient.amount})`}
            </li>
          )
        })}
      </ul>
    </li>
  )
}
