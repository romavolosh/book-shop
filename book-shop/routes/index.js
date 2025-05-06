const express = require('express');
const router = express.Router();
const passport = require('passport');
const bookController = require('../controllers/bookController');
const authController = require('../controllers/authController');
const cartController = require('../controllers/cartController');
const orderController = require('../controllers/orderController');
const postController = require('../controllers/postController');
const { protect, isAdmin } = require('../middleware/auth');

// Публічні маршрути (з protect для підтримки сесії)
router.get('/', protect, postController.getAllPosts);

router.get('/shop', protect, bookController.getAllBooks);
router.get('/books/:id', protect, bookController.getBookById);

// Маршрути автентифікації не потребують protect
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

// Маршрути для замовлень
router.post('/orders', protect, orderController.createOrder);
router.get('/orders/history', protect, orderController.getOrderHistory);

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