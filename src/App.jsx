import { useState, useEffect } from 'react'

import Filter from './components/Filter'
import Notification from './components/Notification'
import PersonForm from './components/PersonForm'
import Persons from './components/Persons'

import personService from './services/persons'

const App = () => {
  const [persons, setPersons] = useState([])

  const [query, setQuery] = useState('')
  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [errorStyle, setErrorStyle] = useState(null)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    personService
      .getAll()
      .then(initialPersons => {
        setPersons(initialPersons)
        setErrorMessage(null)
      })
  }, [])

  const addPerson = (event) => {
    event.preventDefault()
    const personObject = {
      name: newName.replace(/\s+/g, ' ').trim(),
      number: newNumber.replace(/\s+/g, ' ').trim()
    }
    const isExist = persons.some(({ name }) => name === personObject.name)

    const notify = (message, style = null) => {
      setErrorStyle(style)
      setErrorMessage(message)
      setTimeout(() => {
        setErrorMessage(null)
        setErrorStyle(null)
      }, 5000)
    }

    if (!isExist) {
      personService
        .create(personObject)
        .then(returnedPerson => {
          setPersons(persons.concat(returnedPerson))
          notify(`Added ${returnedPerson.name}`, { color: 'green' })
          setNewName('')
          setNewNumber('')
        })
        .catch(error => notify(error.response.data.error))
      return
    }

    if (confirm(
      `${personObject.name} is already added to phonebook replace new number with old one?`
    )) {
      const id = persons.find(person => person.name === personObject.name).id
      personService
        .update(id, personObject)
        .then(returnedPerson => {
          setPersons(
            persons.map(person => person.id !== id ? person : returnedPerson)
          )
          notify(`Edited ${returnedPerson.name}`, { color: 'orange' })
          setNewName('')
          setNewNumber('')
        })
        .catch(error => {
          notify(`Info of ${personObject.name} has already removed from server`)
          setPersons(persons.filter(person => person.id !== id))
        })
      return
    }
  }

  const deletePerson = (event, id) => {
    event.preventDefault()
    const personObject = persons.find(person => person.id === id)
    console.log(personObject)

    if (!confirm(`Delete ${personObject.name} ?`))
      return

    personService
      .deleteOf(id)
      .then(() => {
        setPersons(persons.filter(person => person.id !== id))
      })
  }

  return (
    <>
      <h2>Phonebook</h2>
      <Notification message={errorMessage} style={errorStyle} />
      <Filter
        handleQueryChange={(event) => setQuery(event.target.value)}
        query={query}
      />
      <h3>Add a new</h3>
      <PersonForm
        handleSubmit={addPerson}
        handleNameChange={(event) => setNewName(event.target.value)}
        name={newName}
        handleNumberChange={(event) => setNewNumber(event.target.value)}
        number={newNumber}
      />
      <h3>Numbers</h3>
      <Persons 
        deletePerson={deletePerson}
        persons={persons} query={query.toLowerCase()}
      />
    </>
  )
}

export default App
