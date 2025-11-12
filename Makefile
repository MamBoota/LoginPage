.PHONY: install build start test lint format docker-build docker-run clean


# Установка зависимостей
install:
	npm install

# Сборка проекта
build:
	npm run build

# Запуск разработки
start:
	npm run start

# Запуск тестов
test:
	npm run test

# Проверка кода ESLint
lint:
	npm run lint

# Форматирование кода Prettier
format:
	npm run format

# Сборка Docker-образа
docker-build:
	docker build -t auth-screen .

# Запуск Docker-контейнера
docker-run:
	docker run -p 3000:3000 auth-screen

# Очистка
clean:
	rm -rf dist node_modules
