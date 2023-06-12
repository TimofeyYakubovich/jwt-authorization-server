const Router = require('express').Router;
const userController = require('../controllers/user-controller')
const router = new Router();
const {body} = require('express-validator')
const authMiddleware = require('../middlewares/auth-middleware')

router.post('/registration',
    body('email').isEmail(), // email должен быть емайлом
    body('password').isLength({min: 3, max: 32}),
    userController.registration
);
router.post('/login', userController.login);
router.post('/logout', userController.logout); // выйти с акаунта
router.get('/activate/:link', userController.activate); // активация акаунта по ссылке
router.get('/refresh', userController.refresh); // перезапись access токена
// 2 аргументом добовляем мидлвеер auth-middleware что бы к ней могли обращаться только зарегистрированые пользователи
router.get('/users', authMiddleware, userController.getUsers);  // тестовый эндпоинт

module.exports = router;