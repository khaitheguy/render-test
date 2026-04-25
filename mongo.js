const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://haziq:${password}@cluster0.70eshme.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url)

const phoneSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Phone = mongoose.model('Phone', phoneSchema)

if (process.argv.length == 3) {
    // show all entries
    Phone.find({}).then(result => {
        console.log('phonebook:')
        result.forEach(entry => {
            console.log(`${entry.name} ${entry.number}`)

            mongoose.connection.close()
        })
    })
} else if (process.argv.length == 5) {
    // add name/number
    const phone = new Phone({
        name: process.argv[3],
        number: process.argv[4]
    })

    phone.save().then(result => {
        console.log('number saved!')
        mongoose.connection.close()
    })
} else {
    console.log('Invalid parameters.')
    mongoose.connection.close()
}