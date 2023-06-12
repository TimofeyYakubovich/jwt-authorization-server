const jwt = require('jsonwebtoken')
const tokenModel = require('../models/token-model')

class TokenService {
    generateTokens(payload) {
        const accessToken = jwt.sign(payload, process.env.JWT_ACCESS_SECRET, {expiresIn: '24h'});
        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {expiresIn: '30d'});
        return {
            accessToken,
            refreshToken
        }
    }

    async saveToken(userId, refreshToken) { // функция будет сохронять refreshToken в бд
        // перед сохранением токена в бд находим его по id пользователя
        // при таком подходе в бд по одному пользователю всегда находится 1 токен
        // и при попытке зайти на аккаунт с другова устройства с того устрйоства с каторого вы были залогинены вас выкенет
        // потому чо токен перезатрется и в бд будет сохранен новый токен
        // можно сохронять по несколько токенов для каждог пользователя но надо продумать тот факт что токены перезаписываются и переодически
        // токены могут умирать если не продуамть механизм каторый протухшие токены удаляет с бд то бд будет помойкой токенов
        const tokenData = await tokenModel.findOne({user: userId})
        if (tokenData) { // если в бд что то нашли то у этого поля перезаписываем refreshToken но userId остается тот же
            tokenData.refreshToken = refreshToken;
            return tokenData.save(); // вызываем save() что бы новый refreshToken в бд обновился
        }
        // если условие не выполнилось значит пользвоатеь вероятнее всего логинится первый раз и записи с его id в бд нет
        // поэтому создаем ее
        const token = await tokenModel.create({user: userId, refreshToken})
        return token; // возвращаем токен из функции
        // таким образом после того как пользователь залогинился или зарегистрировался сразу генерируем для него пару токенов
        // и refreshToken сохраняем в бд по id пользвоателя
    }

    async removeToken(refreshToken) {
        const tokenData = await tokenModel.deleteOne({refreshToken}) // будет найдена запись с этим токеном в бд и удалена
        return tokenData;
    }

    // следует токен провалидировать убедится ч он не потделан и срок годности у него не кончился
    // для этого сделаем 2 функции в validateAccessToken validateAccessToken

    validateAccessToken(token) {
        try {
            // после того как токен верефицируем провалидируем вернется тот payload каторый в него вшивали
            // провалидируем токен функцией verify
            const userData = jwt.verify(token, process.env.JWT_ACCESS_SECRET)
            return userData;
        } catch (e) { // если при верефикаци токена произошла ошибка выозвращаем null
            return null;
        }
    }
    validateRefreshToken(token) {
        try {
            const userData = jwt.verify(token, process.env.JWT_REFRESH_SECRET)
            return userData;
        } catch (e) {
            return null;
        }
    }

    async findToken(refreshToken) {
        const tokenData = await tokenModel.findOne({refreshToken}) // будет найдена запись с этим токеном
        return tokenData;
    }
}

module.exports = new TokenService();