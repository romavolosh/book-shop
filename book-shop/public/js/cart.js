document.addEventListener('DOMContentLoaded', function() {
    // Обробка кнопок збільшення/зменшення кількості
    document.querySelectorAll('.quantity-btn').forEach(button => {
        button.addEventListener('click', function() {
            const bookId = this.dataset.bookId;
            const input = document.querySelector(`.quantity-input[data-book-id="${bookId}"]`);
            const currentValue = parseInt(input.value);
            const maxValue = parseInt(input.max);
            
            if (this.classList.contains('increase') && currentValue < maxValue) {
                input.value = currentValue + 1;
                updateQuantity(bookId, currentValue + 1);
            } else if (this.classList.contains('decrease') && currentValue > 1) {
                input.value = currentValue - 1;
                updateQuantity(bookId, currentValue - 1);
            }
        });
    });

    // Обробка прямого введення кількості
    document.querySelectorAll('.quantity-input').forEach(input => {
        input.addEventListener('change', function() {
            const bookId = this.dataset.bookId;
            let value = parseInt(this.value);
            const maxValue = parseInt(this.max);
            
            if (isNaN(value) || value < 1) {
                value = 1;
            } else if (value > maxValue) {
                value = maxValue;
            }
            
            this.value = value;
            updateQuantity(bookId, value);
        });
    });

    function updateQuantity(bookId, quantity) {
        fetch('/cart/update-quantity', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ bookId, quantity })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Кількість оновлено') {
                location.reload(); // Оновлюємо сторінку для відображення нової загальної суми
            } else {
                alert(data.message);
            }
        })
        .catch(error => {
            console.error('Помилка:', error);
            alert('Помилка при оновленні кількості');
        });
    }
});