const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    try {
        // Масив шляхів, які не потребують аутентифікації
        const publicPaths = ['/', '/shop', '/books', '/discounts'];
        
        // Перевіряємо чи шлях починається з одного з публічних шляхів
        const isPublicPath = publicPaths.some(path => 
            req.path === path || req.path.startsWith(`${path}/`)
        );

        const token = req.cookies.token;

        if (!token) {
            req.user = null;
            // Якщо шлях публічний, продовжуємо
            if (isPublicPath) {
                return next();
            }
            // Інакше перенаправляємо на логін
            return res.redirect('/login');
        }

        try {
            const decoded = jwt.verify(token, process.env.SESSION_SECRET);
            const user = await User.findById(decoded.userId).select('-password');

            if (!user) {
                res.clearCookie('token');
                req.user = null;
                if (isPublicPath) {
                    return next();
                }
                return res.redirect('/login');
            }

            // Перевіряємо чи токен скоро закінчиться (менше 24 годин)
            const tokenExp = decoded.exp * 1000;
            const now = Date.now();
            const oneDayInMs = 24 * 60 * 60 * 1000;

            if (tokenExp - now < oneDayInMs) {
                const newToken = jwt.sign(
                    { userId: decoded.userId },
                    process.env.SESSION_SECRET,
                    { expiresIn: '30d' }
                );

                res.cookie('token', newToken, {
                    httpOnly: true,
                    maxAge: 30 * 24 * 60 * 60 * 1000,
                    sameSite: 'strict'
                });
            }

            req.user = user;
            next();
        } catch (error) {
            res.clearCookie('token');
            req.user = null;
            if (isPublicPath) {
                return next();
            }
            res.redirect('/login');
        }
    } catch (error) {
        res.clearCookie('token');
        req.user = null;
        if (isPublicPath) {
            return next();
        }
        res.redirect('/login');
    }
};

exports.isAdmin = async (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).render('error', {
            title: 'Помилка доступу',
            message: 'У вас немає прав для виконання цієї дії'
        });
    }
    next();
};