require('dotenv').config()
const express = require('express')
const app = express()
const PORT = process.env.PORT || 3000
const mongoose = require('mongoose')
const authRouter = require('./routes/authRouter')
app.use(express.json())




app.use(authRouter)

const start = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        app.listen(PORT, () => console.log(`The server has been started on PORT ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}

start()