// универсальный класс ApiError для ошибок каторые связаны с api будет расширять дефолтный Error что бы не прокидывать дефолтный error
module.exports = class ApiError extends Error {
    // добовляем поле status и errors когда будем пробрасывать ошибку так же будем указывать http статус 
    status;
    errors;

    constructor(status, messege, errors = []) {
        // вызываем родительский конструктор с помощью super и туда передаем 
        super(messege);
        // в instanc этого класса помещаем status и errors
        this.status = status;
        this.errors = errors;
    }

    // создадим пару static функции это функции каторые можно использовать не создовая экземпляр класса
    static UnauthorizedError() {
        // будет возвращать экземпляр текущего класса передаем сатус код и сообщение
        return new ApiError(401, 'Пользователь не авторизован')
    }

    // пользователь уазал какие то некаректные парамеры не прошел валидацию и тд.
    static BadRequest(messege, errors = []) {
        return new ApiError(400, messege, errors);
    }
}