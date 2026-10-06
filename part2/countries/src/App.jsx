import { useState, useEffect } from 'react'
import countryService from './services/countries'
import CountryList from './components/CountryList'

const App = () => {
  const [countries, setCountries] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    countryService.getAll().then(data => setCountries(data))
  }, [])

  const handleSearchChange = (event) => setSearch(event.target.value)

  const countriesToShow = countries.filter(country =>
    country.name.common.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <div>
        Find countries <input value={search} onChange={handleSearchChange} />
      </div>
      {search && <CountryList countries={countriesToShow} />}
    </div>
  )
}

export default App