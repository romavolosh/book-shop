const mongoose = require('mongoose');

// Модель книги
const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true // Назва книги (обов'язкове поле)
    },
    author: {
        type: String,
        required: true // Автор книги (обов'язкове поле)
    },
    description: {
        type: String,
        required: true // Опис книги (обов'язкове поле)
    },
    price: {
        type: Number,
        required: true // Ціна книги (обов'язкове поле)
    },
    imageUrl: {
        type: String,
        default: '/images/default-book.jpg' // URL зображення книги (за замовчуванням)
    },
    category: {
        type: String,
        required: true // Категорія книги (обов'язкове поле)
    },
    inStock: {
        type: Number,
        default: 0 // Кількість книг в наявності (за замовчуванням)
    },
    createdAt: {
        type: Date,
        default: Date.now // Дата створення запису (за замовчуванням)
    }
});

module.exports = mongoose.model('Book', bookSchema);