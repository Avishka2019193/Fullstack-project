const PersonForm = ({ onSubmit, newName, onNameChange, newNumber, onNumberChange }) => {
  return (
    <form onSubmit={onSubmit}>
      <div>
        name:
        <input value={newName} onChange={onNameChange} />
      </div><br/>
      <div>
        number:
        <input value={newNumber} onChange={onNumberChange} />
      </div>
      <button type="submit">add</button>
    </form>
  )
}

export default PersonForm