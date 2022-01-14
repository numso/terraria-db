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
  const [selected, setSelected] = React.useState(null)
  const recipes = useLoaderData()
  const matches = recipes.filter(recipe => compare(recipe.item, text))
  if (matches.length > 15) matches.length = 15
  return (
    <div>
      <h1>Terraria Recipes</h1>
      <label>Search</label>
      <input
        type='search'
        className='outline outline-1 py-2 px-3'
        value={text}
        onChange={e => setText(e.target.value)}
      />
      <ul>
        {matches.map(match => (
          <li onClick={() => setSelected(match)}>{match.item}</li>
        ))}
      </ul>
      {selected && <pre>{JSON.stringify(selected, null, 2)}</pre>}
    </div>
  )
}
