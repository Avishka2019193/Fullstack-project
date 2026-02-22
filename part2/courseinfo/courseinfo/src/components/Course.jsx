


const Header = (props) => {
  console.log(props)
  return (
  <h1>{props.course.name}</h1>
  )
}
const Part = (props) => {
  console.log(props)
  return (
    <p>
      {props.part.name} {props.part.exercises}
    </p>
  )
}
const Content = (props) => {
  return (
    <div>
       {props.parts.map(part => (
        <Part key={part.id} part={part} />
      ))}
    </div>
  )
}
const Course = ({ course }) => {
  return (
    <div>
      <Header course={course} />
      <Content parts={course.parts} />
      <Total parts={course.parts} />
    </div>
  )
}
const Total = (props) => {
    const total = props.parts.reduce((sum, part) => sum + part.exercises, 0)
    
  return <p>Total of {total} exercises</p>
}

 export default Course