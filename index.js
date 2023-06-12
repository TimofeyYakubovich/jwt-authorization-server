// npm i express cors cookie-parser
// cors что бы с браузера отправлять запросы без проблем
// npm i nodemon --save-dev
// npm i mongodb mongoose
require('dotenv').config()
// require('dotenv').config() для того что бы прочитать файл .env
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const mongoose = require('mongoose')
const router = require('./router/index')
const errorMiddleware = require('./middlewares/error-middleware')

const PORT = process.env.PORT || 5000;


const app = express();

app.use(express.json());
app.use(cookieParser()); // что бы работал res.cookie
app.use(cors({
    // надо указать с каким доеном ему надо обмениваться куками
    credentials: true, // разрешаем куки
    origin: process.env.CLIENT_URL // указываем юрл фронтенда
}))
app.use('/api', router)
// когда подключаем мидлвеер для обработки ошибок он обезательно должен идти последним в цепочке мидлвееров
app.use(errorMiddleware)


const start = async () => {
    try {
        await mongoose.connect(process.env.DB_URL, {useUnifiedTopology: true, useNewUrlParser: true})
        app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`))
    } catch (e) {
        console.log(e)
    }
}

start();