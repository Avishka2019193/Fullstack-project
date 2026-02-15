import { useState } from 'react'

const Button  = (props) => {
  return (

     <button onClick={props.onClick}>
      {props.text}
    </button>
  )

}

const StatisticLine = (props) => {
  return (
    <tr>
      <td>{props.text}</td> 
      <td>{props.value}</td>
    </tr>
  )
}

const Statistics = (props) => {
  const good = props.good
  const neutral = props.neutral
  const bad = props.bad

  const total = good + neutral + bad
   if ( total == 0 ){
    return <div>

      <div> No feedback given.</div> 
      
      </div>
   }
  const average = (good-bad) / total 
  const positive = ( good/total) * 100

  return (
  
      
    <table>
     <tbody>
      <StatisticLine text="good" value={good} />
      <StatisticLine text="neutral" value={neutral} /> 
      <StatisticLine text="bad" value={bad} /> 
      <StatisticLine text="all" value={total} /> 
      <StatisticLine text="average" value={average} /> 
      <StatisticLine text="positive" value={positive + " %"} /> 
     </tbody>
    </table>
    
  
  )
} 
const App = () => {
  
  const [good, setGood] = useState(0)
  const [neutral, setNeutral] = useState(0)
  const [bad, setBad] = useState(0)
  
  // const total = good + neutral + bad 
  // const average = total === 0 ? 0 : (good-bad)/total
  // const positive = total === 0 ? 0 :(good/total) * 100

  return (
  <div>
     <h3>give Feedback</h3>
    
    <Button onClick={() => setGood(good+1)} style={{ marginRight: 4 }} text="good" /> 
    <Button onClick={() => setNeutral(neutral+1)} style={{ marginRight: 4 }} text="neutral" /> 
    <Button onClick={() => setBad(bad+1)} style={{ marginRight: 4 }} text="bad" /> 

  <div>
    <br/>
    <Statistics good={good} neutral={neutral} bad={bad} />

    </div>
  </div>
  )
}

export default App