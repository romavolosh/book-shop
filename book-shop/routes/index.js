const express = require('express');
const router = express.Router();
const passport = require('passport');
const bookController = require('../controllers/bookController');
const authController = require('../controllers/authController');
const cartController = require('../controllers/cartController');
const { protect, isAdmin } = require('../middleware/auth');

// Публічні маршрути
router.get('/', (req, res) => {
    res.render('index', { title: 'Книжковий магазин' });
});

router.get('/shop', bookController.getAllBooks);
router.get('/books/:id', bookController.getBookById);
router.get('/discounts', (req, res) => {
    res.render('discounts', { title: 'Знижки' });
});

// Маршрути автентифікації
router.get('/login', authController.getLoginPage);
router.post('/login', authController.login);
router.get('/register', authController.getRegisterPage);
router.post('/register', authController.register);
router.get('/logout', authController.logout);

// Захищені маршрути
router.get('/profile', protect, (req, res) => {
    res.render('profile', { 
        title: 'Профіль',
        user: req.user
    });
});

// Маршрути для кошика
router.get('/cart', protect, cartController.getCart);
router.post('/cart/add', protect, cartController.addToCart);
router.post('/cart/remove/:bookId', protect, cartController.removeFromCart);
router.post('/cart/update-quantity', protect, cartController.updateQuantity);

// Адміністративні маршрути
router.post('/books', protect, isAdmin, bookController.addBook);

// Аутентифікація через Google
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.get('/auth/google/callback',
    passport.authenticate('google', { 
        failureRedirect: '/login',
        successRedirect: '/profile'
    })
);

module.exports = router;