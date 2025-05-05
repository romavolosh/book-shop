const Book = require('../models/Book');

// Отримати всі книги з фільтрацією та сортуванням
exports.getAllBooks = async (req, res) => {
    try {
        const { search, sort } = req.query;
        let query = {};
        let sortOption = {};

        // Пошук
        if (search) {
            query = {
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { author: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            };
        }

        // Сортування
        switch (sort) {
            case 'title_asc':
                sortOption = { title: 1 };
                break;
            case 'title_desc':
                sortOption = { title: -1 };
                break;
            case 'price_asc':
                sortOption = { price: 1 };
                break;
            case 'price_desc':
                sortOption = { price: -1 };
                break;
            case 'date_desc':
                sortOption = { createdAt: -1 };
                break;
            case 'date_asc':
                sortOption = { createdAt: 1 };
                break;
            default:
                sortOption = { createdAt: -1 }; // За замовчуванням - найновіші
        }

        const books = await Book.find(query).sort(sortOption);
        
        res.render('shop', { 
            title: 'Книжковий магазин',
            books,
            currentSearch: search || '',
            currentSort: sort || 'date_desc',
            user: req.user // Явно передаємо користувача в шаблон
        });
    } catch (error) {
        console.error('Помилка при отриманні книг:', error);
        res.status(500).render('error', {
            title: 'Помилка',
            message: 'Помилка при завантаженні книг'
        });
    }
};

// Отримати книгу за ID
exports.getBookById = async (req, res) => {
    try {
        const book = await Book.findById(req.params.id);
        if (!book) {
            return res.status(404).render('error', {
                title: 'Помилка',
                message: 'Книгу не знайдено'
            });
        }
        res.render('book-details', { 
            title: book.title,
            book: book,
            user: req.user // Явно передаємо користувача в шаблон
        });
    } catch (error) {
        console.error('Помилка при отриманні книги:', error);
        res.status(500).render('error', {
            title: 'Помилка',
            message: 'Помилка при завантаженні книги'
        });
    }
};

// Додати нову книгу (тільки для адміністраторів)
exports.addBook = async (req, res) => {
    try {
        const { title, author, description, price, category, inStock, imageUrl } = req.body;

        if (!title || !author || !description || !price || !category) {
            req.flash('error', 'Всі поля повинні бути заповнені');
            return res.redirect('/profile');
        }

        const numPrice = parseFloat(price);
        if (isNaN(numPrice) || numPrice <= 0) {
            req.flash('error', 'Ціна повинна бути додатнім числом');
            return res.redirect('/profile');
        }

        const numInStock = parseInt(inStock);
        if (isNaN(numInStock) || numInStock < 0) {
            req.flash('error', 'Кількість в наявності не може бути від\'ємною');
            return res.redirect('/profile');
        }

        const book = new Book({
            title,
            author,
            description,
            price: numPrice,
            category,
            inStock: numInStock,
            imageUrl: imageUrl || '/images/default-book.jpg'
        });

        await book.save();
        
        req.flash('success', 'Книгу успішно додано!');
        res.redirect('/shop');
    } catch (error) {
        console.error('Помилка при додаванні книги:', error);
        req.flash('error', 'Помилка при додаванні книги');
        res.redirect('/profile');
    }
};