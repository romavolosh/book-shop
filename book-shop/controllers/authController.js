const User = require('../models/User');
const jwt = require('jsonwebtoken');
const passport = require('passport');

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            req.flash('error', 'Користувач з такою електронною поштою вже існує');
            return res.redirect('/register');
        }

        const user = new User({
            name,
            email,
            password
        });

        await user.save();

        const token = jwt.sign(
            { userId: user._id },
            process.env.SESSION_SECRET,
            { expiresIn: '30d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000,
            sameSite: 'lax'
        });

        res.redirect('/profile');
    } catch (error) {
        console.error('Помилка при реєстрації:', error);
        req.flash('error', 'Помилка при реєстрації користувача');
        res.redirect('/register');
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            req.flash('error', 'Користувача не знайдено');
            return res.redirect('/login');
        }

        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            req.flash('error', 'Невірний пароль');
            return res.redirect('/login');
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.SESSION_SECRET,
            { expiresIn: '30d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000,
            sameSite: 'lax'
        });

        res.redirect('/profile');
    } catch (error) {
        console.error('Помилка при вході:', error);
        req.flash('error', 'Помилка при вході в систему');
        res.redirect('/login');
    }
};

exports.logout = (req, res) => {
    req.logout(() => {
        res.clearCookie('token');
        req.session.destroy(() => {
            res.redirect('/');
        });
    });
};

exports.getRegisterPage = (req, res) => {
    res.render('register', { 
        title: 'Реєстрація',
        user: req.user 
    });
};

exports.getLoginPage = (req, res) => {
    res.render('login', { 
        title: 'Вхід',
        user: req.user 
    });
};

// Google автентифікація
exports.googleAuth = passport.authenticate('google', {
    scope: ['profile', 'email']
});

exports.googleCallback = (req, res, next) => {
    passport.authenticate('google', async (err, user) => {
        try {
            if (err) {
                console.error('Google auth error:', err);
                req.flash('error', 'Помилка при вході через Google');
                return res.redirect('/login');
            }
            
            if (!user) {
                req.flash('error', 'Не вдалося отримати дані користувача від Google');
                return res.redirect('/login');
            }

            req.login(user, async (loginErr) => {
                if (loginErr) {
                    console.error('Login error:', loginErr);
                    req.flash('error', 'Помилка при вході в систему');
                    return res.redirect('/login');
                }

                const token = jwt.sign(
                    { userId: user._id },
                    process.env.SESSION_SECRET,
                    { expiresIn: '30d' }
                );

                res.cookie('token', token, {
                    httpOnly: true,
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    sameSite: 'lax'
                });

                return res.redirect('/profile');
            });
        } catch (error) {
            console.error('Google callback error:', error);
            req.flash('error', 'Помилка при обробці входу через Google');
            res.redirect('/login');
        }
    })(req, res, next);
};