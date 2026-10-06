import { useState , useEffect } from 'react'
import Filter from './components/Filter'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'
import Notification from './components/Notification'
import personService from './services/persons'

const App = () => {
  const [persons, setPersons] = useState([])
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filter, setFilter] = useState('')
  const [message, setMessage] = useState(null)
  const [messageType, setMessageType] = useState('success')

  useEffect(() => {
    personService
      .getAllpersons()
      .then(initialPersons => {
        setPersons(initialPersons)
      })
  }, [])

  const notify = (text, type = 'success') => {
    setMessageType(type)
    setMessage(text)
    setTimeout(() => {
      setMessage(null)
    }, 5000)
  }

  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

   const handleFilterChange = (event) => {
    setFilter(event.target.value)
  }

  const addPerson = (event) => {
    event.preventDefault()

    const nameExists = persons.find(
      person => person.name === newName)
    
    if (nameExists) {
      const confirmUpdatealert = window.confirm(`${newName} is already added to phonebook, Do you want to replace the old number with a new one?`)
      
       if (!confirmUpdatealert) return

    const updatedPerson = {
      ...nameExists,
      number: newNumber
    }
 

  personService
  .updateperson(nameExists.id, updatedPerson)
  .then(returnedPerson => {
    setPersons(
      persons.map(person =>
        person.id !== nameExists.id ? person : returnedPerson
      )
    )
    setNewName('')
    setNewNumber('')
    notify(`Updated ${returnedPerson.name}'s number`)
  })
  .catch(() => {
    notify(
      `Information of '${nameExists.name}' has already been removed from server`,
      'error'
    )
    setPersons(persons.filter(person => person.id !== nameExists.id))
  })
  return
}
  const personObject = {
      name: newName,
      number: newNumber ,
      id : (persons.length + 1).toString()
    }
  personService
      .createperson(personObject) 
      .then(returnPerson => {
        console.log('returnPerson:', returnPerson) 
        setPersons(persons.concat(returnPerson))
        setNewName('')
        setNewNumber('')
        notify(`Added ${returnPerson.name}`)
        console.log('message state should now be set') 
      })
      .catch(() => {
        notify('Error adding person', 'error')
      })
  }
    const personsToShow = persons.filter(person =>
    person.name.toLowerCase().includes(filter.toLowerCase())
  )

  const handleDeletePerson = (id, name) => {
  if (window.confirm(`Delete ${name}?`)) {
    personService
      .removeperson(id)
      .then(() => {
        setPersons(prev =>
          prev.filter(person => person.id !== id)
        )
        notify(`Deleted ${name}`)
      })
      .catch(() => {
        notify(`'${name}' was already removed from server`, 'error')
        setPersons(prev => prev.filter(person => person.id !== id))
      })
  }
}
  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={message} type={messageType} />
       <div>
        <Filter 
        filter={filter}
        onChange={handleFilterChange}
      />
      </div>
      <h3>Add a new</h3>
       <PersonForm
        onSubmit={addPerson}
        newName={newName}
        newNumber={newNumber}
        onNameChange={handleNameChange}
        onNumberChange={handleNumberChange}
      />

      <h2>Numbers</h2>
       
        <Persons persons={personsToShow} onDelete={handleDeletePerson} />
      
    </div>
  )
}

export default App