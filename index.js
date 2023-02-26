const express = require("express")
const app = express()

app.use(express.json())

let persons = [
  {
    "id": 1,
    "name": "Arto Hellas",
    "number": "040-123456"
  },
  {
    "id": 2,
    "name": "Ada Lovelace",
    "number": "39-44-5323523"
  },
  {
    "id": 3,
    "name": "Dan Abramov",
    "number": "12-43-234345"
  },
  {
    "id": 4,
    "name": "Mary Poppendieck",
    "number": "39-23-6423122"
  }
]


app.get("/info", (request, response) => {
  const personsCount = persons.length
  const now = Date()

  response.send(`
    <p>Phonebook has info for ${personsCount} people</p>
    <p>${now}</p>
  `)
})

app.get("/api/persons", (request, response) => {
  response.json(persons)
})

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find((p) => p.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).json({
      error: "not found"
    })
  }
})

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id)

  // Create a new list of persons excluding provided id
  persons = persons.filter(person => person.id !== id)
  // Send No content(204) to indicate success
  response.status(204).end()
})

const generateRandomID = () => {
  const max = 1000000
  return Math.floor(Math.random() * max)
}

const generateUniqueID = () => {
  let tempID = generateRandomID()
  while (isExistingID(tempID)) {
    tempID = generateRandomID()
  }
  return tempID
}

const isExistingID = (id) => {
  const idList = persons.map(person => person.id)
  return idList.includes(id)
}

app.post("/api/persons", (request, response) => {
  const body = request.body
  console.log(body)

  if (!body.name) {
    return response.status(404).json({
      error: "content missing"
    })
  }

  const newPerson = {
    name: body.name,
    number: body.number,
    id: generateUniqueID()
  }

  persons = persons.concat(newPerson)
  response.json(newPerson)
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})