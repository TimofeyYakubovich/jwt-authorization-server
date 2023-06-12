const userService = require('../service/user-service')
const {validationResult} = require('express-validator')
const ApiError = require('../exceptions/api-error')

class userController {
    async registration (req, res, next) {
        try {
            const errors = validationResult(req); // в validationResult передаем запрос req она вынимает из него нужные поля и валидирует их
            if (!errors.isEmpty()) { // если массив errors не пустой то передаем ошибку в мидлвеер ошибки errorMiddleware
                return next(ApiError.BadRequest('Ошибка при регистрации', errors.array()))
            }
            const {email, password} = req.body;
            const userData = await userService.registration(email, password);
            // refreshToken будем хронить в куках, вызываем функцию res.cookie 1 ключ по каторому этот куки будет сохроняться
            // 2 параметр сама кука 3 объект с опциями maxAge время жизни 30 дней пересичтываем в милисикундах и уазываем флаг httpOnly : true
            // что бы эту куку нельзя было изменять и получать внутри браузера с помощью JS
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            // функция registration возврощает токены и иформацию о пользователе возврощаем их на клиент
            return res.json(userData)
        } catch (e) {
            // console.log(e)
            // вместо console.log вызываем функцию next и туда передаем ошибку если в этот next попадает ApiError он будет обработан
            // соответствующим образом вызывая next с ошибкой попадаем в мидлвеер errorMiddleware
            next(e);
        }
    }

    async login (req, res, next) {
        try {
            const {email, password} = req.body;
            const userData = await userService.login(email, password);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData)
        } catch (e) {
            next(e);
        }
    }

    async logout (req, res, next) {
        try {
            const {refreshToken} = req.cookies; // достаем refreshToken из поля cookies
            const token = await userService.logout(refreshToken);
            res.clearCookie('refreshToken'); // удаляем саму куку с refreshToken
            return res.json(token); // можно было бы вернуть просто 200 статус код для аглядности вернем токен
        } catch (e) {
            next(e);
        }
    }

    async activate (req, res, next) {
        try {
            const activationLink = req.params.link // из строки запроса как динамический параметр получаем ссылку активации
            await userService.activate(activationLink);
            // так как бек и фронт будут находится на разных хостах после того как пользователь перешел по этой ссылке надо редеректнуть его
            // на фронтенд в express такая возможность есть у res вызываем функцию redirect и передаем тда адрес клиента
            return res.redirect(process.env.CLIENT_URL)
        } catch (e) {
            // console.log(e)
            next(e);
        }
    }

    async refresh (req, res, next) {
        try {
            const {refreshToken} = req.cookies; // достаем refreshToken из поля cookies
            // так как мы токен перезаписываем надо токен опять сгенерировать устанавиь в куки и отправить ответ на клиент
            const userData = await userService.refresh(refreshToken);
            res.cookie('refreshToken', userData.refreshToken, {maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true})
            return res.json(userData)
        } catch (e) {
            next(e);
        }
    }

    async getUsers (req, res, next) {
        try {
            // эта функция должна быть доступна только авторизованым пользователям (с токеном) для этого сделаем мидлвеер auth-middleware
            const users = await userService.getAllUsers()
            return res.json(users)
        } catch (e) {
            next(e);
        }
    }
}
module.exports = new userController();