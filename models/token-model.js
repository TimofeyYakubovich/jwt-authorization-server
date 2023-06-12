// схема для хранения refresh токена id пользователя сюда же можно добавить ip адрес с каторого зашел пользователь, 
// Фингерпринт (отпечаток браузера) и тд.
// мы будем хранить только id пользвателя и сам refreshToken
const {model, Schema} = require('mongoose')

const TokenSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User'}, // ссылка на пользователя, тип ObjectId достаем из Shema поле Types, и указываем ссылку 
    // на модель User
    refreshToken: {type: String, required: true} // refreshToken просто строка каторая обезательна
})

module.exports = model('Token', TokenSchema)