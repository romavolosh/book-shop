# Використовуємо офіційний образ Node.js
FROM node:18-alpine

# Встановлюємо робочу директорію в контейнері
WORKDIR /usr/src/app

# Копіюємо package.json та package-lock.json
COPY package*.json ./

# Встановлюємо залежності
RUN npm install

# Копіюємо інші файли проекту
COPY . .

# Відкриваємо порт 3000
EXPOSE 3000

# Запускаємо додаток
CMD ["npm", "start"]