const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Book = require('../models/Book');

// Створити нове замовлення
exports.createOrder = async (req, res) => {
    try {
        const { fullName, phone, city, address, postCode } = req.body;

        // Знаходимо кошик користувача
        const cart = await Cart.findOne({ user: req.user._id }).populate('items.book');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Кошик порожній' });
        }

        // Розраховуємо загальну суму
        let totalAmount = 0;
        const orderItems = cart.items.map(item => {
            const itemTotal = item.book.price * item.quantity;
            totalAmount += itemTotal;
            return {
                book: item.book._id,
                quantity: item.quantity,
                price: item.book.price
            };
        });

        // Створюємо нове замовлення
        const order = new Order({
            user: req.user._id,
            items: orderItems,
            totalAmount,
            delivery: {
                fullName,
                phone,
                city,
                address,
                postCode
            }
        });

        await order.save();

        // Оновлюємо кількість книг в наявності
        for (const item of cart.items) {
            await Book.findByIdAndUpdate(item.book._id, {
                $inc: { inStock: -item.quantity }
            });
        }

        // Очищаємо кошик
        await Cart.findByIdAndDelete(cart._id);

        res.json({
            success: true,
            message: 'Замовлення успішно створено',
            orderId: order._id
        });
    } catch (error) {
        console.error('Помилка при створенні замовлення:', error);
        res.status(500).json({
            success: false,
            message: 'Помилка при створенні замовлення'
        });
    }
};

// Отримати історію замовлень користувача
exports.getOrderHistory = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id })
            .populate('items.book')
            .sort({ createdAt: -1 });

        res.render('order-history', {
            title: 'Історія замовлень',
            orders
        });
    } catch (error) {
        console.error('Помилка при отриманні історії замовлень:', error);
        req.flash('error', 'Помилка при отриманні історії замовлень');
        res.redirect('/profile');
    }
};