require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const Phone = require('./models/phonebook')

const app = express()

morgan.token('post', (req) => JSON.stringify(req.body))

app.use(express.json())
app.use(express.static('dist'))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post'))

app.get('/info', (request, response) => {
    const currentDate = new Date()

    Phone.find({}).then(phones => {
        response.send(`<p>Phonebook has info for ${phones.length} people</p><p>${currentDate}</p>`)
    })
})

app.get('/api/persons', (request, response) => {
    Phone.find({}).then(phones => {
        response.json(phones)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    Phone.findById(request.params.id)
    .then(phone => {
        if (phone) {
            response.json(phone)
        } else {
            response.status(404).end()
        }
    })
    .catch(error => next(error))
})


app.delete('/api/persons/:id', (request, response, next) => {
    Phone.findByIdAndDelete(request.params.id)
    .then(result => {
        response.status(204).end()
    })
    .catch(error => next(error))
})

const generateId = () => Math.floor(Math.random() * 1000)

app.post('/api/persons', (request, response, next) => {
    const phone = new Phone({
        name: request.body.name,
        number: request.body.number,
        id: String(generateId())
    })

    phone.save()
    .then(result => {
        console.log('number saved!')
        response.json(result)
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
    const { name, number } = request.body

    Phone.findById(request.params.id)
    .then(phone => {
        if (!phone) {
            return response.status(404).end()
        }

        phone.name = name
        phone.number = number

        return phone.save().then(updatedPhone => {
            response.json(updatedPhone)
        })
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.error(error.message)

    if (error.name === 'CastError') {
        return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({ error: error.message })
    }

    next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})