import { useState } from 'react'
import Country from './Country'

const CountryList = ({ countries }) => {
  const [selected, setSelected] = useState(null)

  if (countries.length > 10) {
    return <p>Too many matches, specify another filter</p>
  }

  if (countries.length === 1) {
    return <Country country={countries[0]} />
  }

  if (countries.length > 1) {
    const shown = countries.find(c => c.cca3 === selected)

    return (
      <div>
        <ul>
          {countries.map(country => (
            <li key={country.cca3}>
              {country.name.common}
              <button onClick={() => setSelected(country.cca3)} style={{ marginLeft: '5px' }}>show</button>
            </li>
          ))}
        </ul>
        {shown && <Country country={shown} />}
      </div>
    )
  }

  return <p>No matches</p>
}

export default CountryList