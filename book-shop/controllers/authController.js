const User = require('../models/User');
const jwt = require('jsonwebtoken');
const passport = require('passport');

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Перевіряємо, чи існує користувач
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Користувач з такою електронною поштою вже існує' });
        }

        // Створюємо нового користувача
        const user = new User({
            name,
            email,
            password
        });

        await user.save();

        // Створюємо токен
        const token = jwt.sign(
            { userId: user._id },
            process.env.SESSION_SECRET,
            { expiresIn: '30d' }  // Збільшуємо до 30 днів
        );

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
            sameSite: 'strict'
        });

        res.redirect('/profile');
    } catch (error) {
        res.status(500).json({ message: 'Помилка при реєстрації користувача' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Знаходимо користувача
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Користувача не знайдено' });
        }

        // Перевіряємо пароль
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Невірний пароль' });
        }

        // Створюємо токен
        const token = jwt.sign(
            { userId: user._id },
            process.env.SESSION_SECRET,
            { expiresIn: '30d' }  // Збільшуємо до 30 днів
        );

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
            sameSite: 'strict'
        });

        res.redirect('/profile');
    } catch (error) {
        res.status(500).json({ message: 'Помилка при вході в систему' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
};

exports.getRegisterPage = (req, res) => {
    res.render('register', { title: 'Реєстрація' });
};

exports.getLoginPage = (req, res) => {
    res.render('login', { title: 'Вхід' });
};

// Google автентифікація
exports.googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email']
});

exports.googleCallback = (req, res, next) => {
    passport.authenticate('google', async (err, user) => {
        if (err) return next(err);
        if (!user) return res.redirect('/login');

        const token = jwt.sign(
            { userId: user._id },
            process.env.SESSION_SECRET,
            { expiresIn: '30d' }  // Збільшуємо до 30 днів
        );

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
            sameSite: 'strict'
        });

        res.redirect('/profile');
    })(req, res, next);
};