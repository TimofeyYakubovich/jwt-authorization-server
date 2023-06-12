// класс user-dto (data transfer object) простой класс с полями каорые будем отпралять на клиент

module.exports = class UserDto {
    email;
    id;
    isActivated; // полу активирован аккаунт или нет

    constructor(model) { // конструктор принимает параметором модель и из модели достаем поля каторые нас интересуют
        this.email = model.email;
        this.id = model._id;
        this.isActivated = model.isActivated;
    }
}