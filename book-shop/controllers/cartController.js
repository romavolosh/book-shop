const Cart = require('../models/Cart');
const Book = require('../models/Book');

// Отримати кошик користувача
exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate('items.book');
        
        if (!cart) {
            cart = { items: [] };
        }

        res.render('cart', { 
            title: 'Кошик',
            cart,
            user: req.user
        });
    } catch (error) {
        req.flash('error', 'Помилка при отриманні кошика');
        res.redirect('/');
    }
};

// Додати товар до кошика
exports.addToCart = async (req, res) => {
    try {
        const { bookId, quantity = 1 } = req.body;
        
        // Перевіряємо чи існує книга
        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ success: false, message: 'Книгу не знайдено' });
        }

        // Перевіряємо чи достатньо книг в наявності
        if (book.inStock < quantity) {
            return res.status(400).json({ success: false, message: 'Недостатньо книг в наявності' });
        }

        let cart = await Cart.findOne({ user: req.user._id });

        if (!cart) {
            // Створюємо новий кошик якщо його не існує
            cart = new Cart({
                user: req.user._id,
                items: [{ book: bookId, quantity }]
            });
        } else {
            // Перевіряємо чи є вже така книга в кошику
            const itemIndex = cart.items.findIndex(item => item.book.toString() === bookId);
            
            if (itemIndex > -1) {
                // Оновлюємо кількість якщо книга вже є в кошику
                cart.items[itemIndex].quantity += quantity;
            } else {
                // Додаємо нову книгу до кошика
                cart.items.push({ book: bookId, quantity });
            }
        }

        await cart.save();
        
        res.json({ success: true, message: 'Книгу додано до кошика' });
    } catch (error) {
        console.error('Помилка при додаванні до кошика:', error);
        res.status(500).json({ success: false, message: 'Помилка при додаванні до кошика' });
    }
};

// Видалити товар з кошика
exports.removeFromCart = async (req, res) => {
    try {
        const { bookId } = req.params;
        
        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Кошик не знайдено' });
        }

        cart.items = cart.items.filter(item => item.book.toString() !== bookId);
        await cart.save();

        req.flash('success', 'Товар видалено з кошика');
        res.redirect('/cart');
    } catch (error) {
        req.flash('error', 'Помилка при видаленні з кошика');
        res.redirect('/cart');
    }
};

// Оновити кількість товару в кошику
exports.updateQuantity = async (req, res) => {
    try {
        const { bookId, quantity } = req.body;
        
        if (quantity < 1) {
            return res.status(400).json({ message: 'Кількість має бути більше 0' });
        }

        const book = await Book.findById(bookId);
        if (!book) {
            return res.status(404).json({ message: 'Книгу не знайдено' });
        }

        if (book.inStock < quantity) {
            return res.status(400).json({ message: 'Недостатньо книг в наявності' });
        }

        const cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            return res.status(404).json({ message: 'Кошик не знайдено' });
        }

        const itemIndex = cart.items.findIndex(item => item.book.toString() === bookId);
        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Товар не знайдено в кошику' });
        }

        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        res.json({ message: 'Кількість оновлено', cart });
    } catch (error) {
        res.status(500).json({ message: 'Помилка при оновленні кількості' });
    }
};