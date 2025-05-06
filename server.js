const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const path = require('path');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const passport = require('passport');
const session = require('express-session');
const flash = require('connect-flash');
require('dotenv').config();

// Passport конфігурація
require('./book-shop/config/passport');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'book-shop/public')));

// Налаштування сесій з більш надійними параметрами
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
        sameSite: 'lax'
    },
    rolling: true // Оновлює cookie при кожному запиті
}));

// Flash повідомлення
app.use(flash());

// Ініціалізація Passport
app.use(passport.initialize());
app.use(passport.session());

// Додаємо глобальні змінні для passport
app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.isAuthenticated = req.isAuthenticated();
    next();
});

// View Engine
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'book-shop/views'));
app.set('layout', 'layouts/main');

// Додаємо глобальні змінні
app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// Routes
const indexRouter = require('./book-shop/routes/index');
app.use('/', indexRouter);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI + 'bookshop', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('MongoDB підключена'))
.catch(err => {
    console.error('Помилка підключення до MongoDB:', err);
    process.exit(1);
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Щось пішло не так!');
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущено на http://localhost:${PORT}`);
});