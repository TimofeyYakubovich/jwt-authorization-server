const UserModel = require('../models/user-model')
const bcrypt = require('bcrypt')
const uuid = require('uuid')
const mailService = require('./mail-service')
const tokenService = require('./token-service')
const UserDto = require('../dtos/user-dto')
const ApiError = require('../exceptions/api-error')
const userModel = require('../models/user-model')

class UserService {
    async registration (email, password) {
        const candidate = await UserModel.findOne({email});
        if (candidate) {
            // там где пробрасывали обыный Error теперь будем пробрасывать ApiError
            // throw new Error(`Пользователь с почтовым адресом ${email} уже существует`)
            // в этом случае пользователь передал емаил каторый уже находится в бд поэтому это BadRequest
            throw ApiError.BadRequest(`Пользователь с почтовым адресом ${email} уже существует`)
        }
        const hashPassword = await bcrypt.hash(password, 3);
        const activationLink = uuid.v4(); // сгенерируем ссылку для активации
        const user = await UserModel.create({email, password: hashPassword, activationLink})
        // псоле создания пользователя надо тправить ему на почту сообщение для этого есть MailService
        // к activationLink добовляем юрл сайта и эндпоинт api/activate/ тоесть оправляем пользователю ссылка на этот эндпоин
        // await mailService.sendActivationMail(email, activationLink)
        await mailService.sendActivationMail(email, `${process.env.API_URL}/api/activate/${activationLink}`)

        // сгенерируем jwt токены
        // generateTokens вернет пару токенов помещаем их в объект tokens
        // параметром она принимает payload некаторая информация о пользователе но нельзя помещать туда пароль
        // создадим файл класс user-dto (data transfer object) простой класс с полями каторые будем отпралять на клиент
        // на основании модели user создадим userDto что бы выкинуть из модели ненужные поля создаем экземпляр класса и параметром в конструктор
        // передаем модель user (объект user)
        const userDto = new UserDto(user) // поитогу userDto будет обладать 3 полями id email isActivated
        // и ее используем как payload
        // функция generateTokens ожидает обычный объект поэтому разварачиваем userDto в новый объект
        const tokens = tokenService.generateTokens({...userDto}) 
        // сохроняем refreshToken в бд
        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        
        // возврощаем из функции accessToken refreshToken и userDto
        return {...tokens, user: userDto}
    }

    async activate(activationLink) {
        const user = await UserModel.findOne({activationLink})
        if (!user) {
            // throw new Error('Неккоректная ссылка активации')
            throw ApiError.BadRequest('Неккоректная ссылка активации')
        }
        user.isActivated = true;
        await user.save();
    }

    async login(email, password) {
        const user = await userModel.findOne({email})
        if (!user) {
            throw ApiError.BadRequest('Пользователь с таким email не найден')
        }
        const isPassEquals = await bcrypt.compare(password, user.password)
        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный пароль')
        }
        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})

        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {...tokens, user: userDto}
    }

    async logout(refreshToken) {
        // все что надо удалить токен из бд через tokenService
        const token = await tokenService.removeToken(refreshToken)
        return token;
    }

    async refresh(refreshToken) {
        if(!refreshToken) { // если пришел null или undefined выкидываем ошибку
            // сдесь уже возвращаем UnauthorizedError поскольку если токена у поьзователя нет то он и не авторизован
            throw ApiError.UnauthorizedError(); 
        }
        // далее следует токен провалидировать убедится ч он не потделан и срок годности у него не кончился
        // для этого сделаем 2 функции в tokenService
        const userData = await tokenService.validateRefreshToken(refreshToken); // валидируем refreshToken
        // далее надо убедиться что этот токен есть в бд
        const tokenFromDb = await tokenService.findToken(refreshToken);
        // делаем проверку что и валидация и посик в бд прошли успешно
        if (!userData || !tokenFromDb) { // если где то пришел null то выбрасываем ошибку поьзователь не авторизован
            throw ApiError.UnauthorizedError();
        }
        // если условие не выполнилось точно так же как и при логине генерируем новую пару токенов
        // refreshToken токен сохраняем в бд и возврощаем ответ
        const user = await userModel.findById(userData.id) // находим пользователя по id 
        const userDto = new UserDto(user)
        const tokens = tokenService.generateTokens({...userDto})

        await tokenService.saveToken(userDto.id, tokens.refreshToken)
        return {...tokens, user: userDto}
    }

    async getAllUsers() {
        const users = await userModel.find(); // вернут все записи в бд
        return users;
    }
}

module.exports = new UserService();