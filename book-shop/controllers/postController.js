const Post = require('../models/Post');

exports.getAllPosts = async (req, res) => {
    try {
        // Статичні пости для відображення на головній сторінці
        const posts = [
            {
                title: "Скоро літні знижки!",
                content: "Готуйтеся до гарячого літнього сезону! З 1 червня стартують знижки до 30% на популярні книжкові новинки. Не пропустіть можливість поповнити свою бібліотеку за вигідними цінами.",
                imageUrl: "https://images.unsplash.com/photo-1467951591042-f388365db261?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
                createdAt: new Date("2025-05-01")
            },
            {
                title: "Знижки до 8 березня",
                content: "Дякуємо всім, хто взяв участь у нашій святковій акції до Міжнародного жіночого дня! Було приємно бачити стільки щасливих читачів у нашому магазині.",
                imageUrl: "https://images.unsplash.com/photo-1474366521946-c3d4b507abf2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
                createdAt: new Date("2025-03-08")
            },
            {
                title: "Нове поповнення асортименту",
                content: "Раді повідомити про надходження нових книг! У нашому магазині з'явилися довгоочікувані новинки від українських та зарубіжних авторів. Запрошуємо всіх любителів читання ознайомитися з новим асортиментом.",
                imageUrl: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
                createdAt: new Date("2025-04-15")
            }
        ];

        res.render('index', { 
            title: 'Книжковий магазин',
            posts,
            user: req.user
        });
    } catch (error) {
        console.error('Помилка при відображенні постів:', error);
        res.status(500).render('error', {
            title: 'Помилка',
            message: 'Помилка при завантаженні сторінки'
        });
    }
};