const {model, Schema} = require('mongoose')

const UserShema = new Schema({
    email: {type: String, unique: true, required: true},
    password: {type: String, required: true},
    isActivated: {type: Boolean, default: false}, // подтвердил почту пользователь или нет
    activationLink: {type: String}  // ссылка для активации
})

module.exports = model('User', UserShema)