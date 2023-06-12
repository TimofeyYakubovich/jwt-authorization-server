// для работы с почтой понадбится npm i nodemailer
const nodemailer = require('nodemailer')

class MailService {

    constructor() { // в конструкторе инициализируем почтовый клиент
        // поле transporter с помощью него будем оправлять письма на почту
        this.transporter = nodemailer.createTransport({ // у nodemailer вызываем функцию createTransport и в ней указываем некаторые настрйки
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        })
    }

    async sendActivationMail(to, link) { // email по каторому будет тправляться ссылка и сама ссылка
        // что бы отправить письмо у transporter вызываем функцию sendMail параметром принимает объект с плями
        await this.transporter.sendMail({
            from: process.env.SMTP_USER, // с какой почты будут уходить письма
            to,                          // куда будут уходить письма
            subject: 'Активация аккаунта на ' + process.env.API_URL,  // тема письма, API_URL юрл сайта
            text: '', // в письме никакова текста не будет 
            html:     // отправлять будем свверстаный html
                `
                    <div>
                        <h1>Для активации перейдите по ссылке</h1>
                        <a href="${link}">${link}</a>
                    </div>
                `
        })
    } 
}

module.exports = new MailService();