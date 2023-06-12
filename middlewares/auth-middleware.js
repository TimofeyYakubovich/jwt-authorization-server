// мидлвеер что бы конкретный эндпоинт поигли дергать только авторизованные пользователи (с токеном)

// отправляем гет запрос на получение пользвателей GET /api/users и знаем что этот запрос доступен только авторизованным пользователям
// поэтому к запросу надо как о прицепить токен делается эо с помощью заголовков Headers:
// обычно токен указывают в заголовке Authorization: "Bearer ${ACCESS_TOKEN}"
// сначала указывается тип окена обычно это Bearer затем сам токен доступа ${ACCESS_TOKEN}
// в этом мидлвеер вытащим токен из заголовка

const ApiError = require('../exceptions/api-error')
const tokenService = require('../service/token-service')

module.exports = function (req, res, next) {
    try {
        const authorizationHeader = req.headers.authorization; // достаем заголовок authorization
        if (!authorizationHeader) { // если этот хедер не указан то пользователь не авторизован
            return next(ApiError.UnauthorizedError()); 
        }
        // так как нас интересует сам токен а не его тип делим стрку на 2 части по пробелу и берем 2 часть
        const accessToken = authorizationHeader.split(' ')[1];
        if(!accessToken) { // если токена нет то пользователь не авторизован
            return next(ApiError.UnauthorizedError());
        }
        // провалидируем accessToken вернется тот payload каторый в него вшивали
        const userData = tokenService.validateAccessToken(accessToken);
        if(!userData) { // если при валидации произошла ошибка функция аернет null 
            return next(ApiError.UnauthorizedError());
        }

        // в запросе создаем новое поле user и туда передаем эти данные
        req.user = userData;
        next() // вызываем следующтй в цепочке мидлвеер

    } catch (e) {
        return next(ApiError.UnauthorizedError())
    }
}