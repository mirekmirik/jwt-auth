const { Router } = require('express')
const router = Router()
const User = require('../models/User')
const Role = require('../models/Role')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const { check } = require('express-validator')
const { validationResult } = require('express-validator')
const { secret } = require('../config')
const authMiddleware = require('../middleware/authMiddleware')
const roleMiddleware = require('../middleware/roleMiddleware')

const generateAccessToken = (id, roles) => {
    const payload = {
        id,
        roles
    }
    return jwt.sign(payload, secret, { expiresIn: "24h" })
}


//РЕГИСТРАЦИЯ
router.post('/registration', [
    check('username', 'Имя пользователя не может быть пустым').notEmpty(),
    check('password', 'Пароль должен быть больше 4 и меньше 10 символов').isLength({ min: 4, max: 10 })
], async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: "Ошибка при регистрации", errors })
        }
        const { username, password } = req.body
        const candidate = await User.findOne({ username })
        if (candidate) {
            return res.status(400).json({ message: 'Пользователь с таким именем уже существует' })
        }
        const hashPassword = bcrypt.hashSync(password, 7)
        const userRole = await Role.findOne({ value: "USER" })
        const user = new User({
            username,
            password: hashPassword,
            roles: [userRole.value]
        })
        await user.save((err) => {
            if (err) {
                res.json({ error: 'Что-то пошло не так, попробуйте еще раз' })
            } else {
                res.json({ message: 'Пользователь успешно зарегистрирован' })
            }
        })

    } catch (e) {
        console.log(e)
        res.status(400).json({ message: 'Registration error' })
    }
})


//ВХОД
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body
        const user = await User.findOne({ username })
        if (!user) {
            return res.status(400).json({ message: `Пользователь ${username} не найден` })
        }
        const validPassword = bcrypt.compare(password, user.password)
        if (!validPassword) {
            return res.status(400).json({ message: 'Введен неверный пароль' })
        }
        const token = generateAccessToken(user._id, user.roles)
        return res.json({ token })
    } catch (e) {
        console.log(e)
        res.status(400).json({ message: 'Login error' })
    }
})

router.get('/users', roleMiddleware(['USER', 'ADMIN']), async (req, res) => {
    try {
        const users = await User.find()
        res.json(users)
    } catch (e) {
        console.log(e)
    }
})




module.exports = router