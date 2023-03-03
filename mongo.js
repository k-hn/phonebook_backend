const mongoose = require("mongoose")

if (process.argv.length < 3) {
    console.log("provide at least 3 arguments")
    process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://fullstack:${password}@cluster0.1wbrwbm.mongodb.net/phonebook?retryWrites=true&w=majority`

mongoose.set("strictQuery", false)
mongoose.connect(url)

const phonebookSchema = new mongoose.Schema({
    name: String,
    number: String
})

const Phonebook = mongoose.model("Phonebook", phonebookSchema)

if (process.argv.length === 3) {
    // Return all phonebook entries
    Phonebook
        .find({})
        .then(result => {
            console.log("phonebook:")
            result.forEach((contact) => {
                console.log(`${contact.name}\t${contact.number}`)
            })
            mongoose.connection.close()
        })
    return
}

if (process.argv.length !== 5) {
    console.log("You need to provide a password, name, and number to save")
    process.exit(1)
}
const name = process.argv[3]
const number = process.argv[4]
const contact = new Phonebook({
    name,
    number
})
contact.save().then(result => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
})



// Note.find({}).then(result => {
//     result.forEach(note => {
//         console.log(note)
//     })
//     mongoose.connection.close()
// })