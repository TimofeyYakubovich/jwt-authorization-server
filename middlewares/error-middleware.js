// мидлвеер универсальный обработчик ошибок каторые связаны с api что бы не прокидывать дефолтный error
// мидлвеер будет отвечать за обработку ошибок
const ApiError = require('../exceptions/api-error')

module.exports = function (err, req, res, next) {
    // первым параметро принимает саму ошибку 
    console.log(err); // выводим в консоль что бы этого не делать в каждой функции контролере

    // Оператор instanceof позволяет проверить, принадлежит ли объект указанному классу, с учётом наследования
    // class Rabbit {}
    // let rabbit = new Rabbit();
    // // это объект класса Rabbit?
    // alert( rabbit instanceof Rabbit ); // true

    if(err instanceof ApiError) { // если ошибка err является инстансом класса ApiError
        // то возвращаем статус из ошибки и сообщение из err и массив ошибок
        return res.status(err.status).json({messege: err.message, errors: err.errors})
    }
    // если условие не выполнилось то ошибку мы не предусмотрели
    return res.status(500).json({messege: 'Непредвиденная ошибка'})
}