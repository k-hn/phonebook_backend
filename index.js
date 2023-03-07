require("dotenv").config()
const express = require("express")
const morgan = require("morgan")
const Phonebook = require("./models/phonebook")

const app = express()

app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-payload'))
app.use(express.static('build'))

// define custom token
morgan.token("post-payload", function (req, res) {
  return JSON.stringify(req.body)
})

// Middleware for error handling
const errorHandler = (error, request, response, next) => {
  console.log(error.message)

  if (error.name === "CastError") {
    return response.status(400).send({
      error: "malformed id"
    })
  } else if (error.name === "ValidationError") {
    return response.status(400).json({
      error: error.message
    })
  }

  next(error)
}

// Middleware to handle unknown endpoints
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: "unknown endpoint" })
}


app.get("/info", (request, response) => {
  const now = Date()

  getPersons().then(persons => {
    response.send(`
    <p>Phonebook has info for ${persons.length} people</p>
    <p>${now}</p>
  `)
  })
})

app.get("/api/persons", (request, response) => {
  getPersons().then(persons => response.json(persons))
})

const getPersons = () => {
  return Phonebook.find({})
}

app.get("/api/persons/:id", (request, response, next) => {
  Phonebook
    .findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch(error => next(error))
})

app.delete("/api/persons/:id", (request, response, next) => {
  Phonebook.findByIdAndDelete(request.params.id)
    .then(result => {
      console.log(`Contact id: ${request.params.id} deleted`)
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put("/api/persons/:id", (request, response, next) => {
  const { name, number } = request.body

  const contact = {
    name,
    number
  }

  Phonebook.findByIdAndUpdate(
    request.params.id,
    contact,
    { new: true, runValidators: true, context: "query" })
    .then(updatedContact => {
      response.json(updatedContact)
    })
    .catch(error => next(error))
})

const nameExists = (name) => {

  return getPersons()
    .then(persons => {
      const nameList = persons.map(person => person.name)
      return nameList.includes(name)
    })
}

app.post("/api/persons", (request, response, next) => {
  const { name, number } = request.body

  const newPerson = new Phonebook({
    name,
    number
  })

  nameExists(name)
    .then(isExistingName => {
      if (isExistingName) {
        response.status(400).json({
          error: "name must be unique"
        })
      } else {
        newPerson.save()
          .then((savedPerson) => {
            response.json(savedPerson)
          })
          .catch(error => next(error))
      }
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})