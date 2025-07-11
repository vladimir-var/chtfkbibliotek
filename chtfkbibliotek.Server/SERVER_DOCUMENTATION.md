# Документація серверної частини проекту ЧТФК Бібліотека

## 1. Технічний стек

### 1.1 Основні технології
- **ASP.NET Core 8.0** - фреймворк для розробки веб-додатків
- **Entity Framework Core** - ORM для роботи з базою даних
- **PostgreSQL** - система управління базами даних
- **Swagger/OpenAPI** - документація API
- **CORS** - налаштування для кросс-доменних запитів

### 1.2 Залежності проекту
- EFCore.NamingConventions (9.0.0)
- Microsoft.AspNetCore.SpaProxy (8.0.4)
- Microsoft.EntityFrameworkCore (9.0.4)
- Npgsql.EntityFrameworkCore.PostgreSQL (9.0.4)
- Swashbuckle.AspNetCore (7.2.0)

## 2. Архітектура проекту

### 2.1 Структура директорій
```
chtfkbibliotek.Server/
├── Controllers/     # Контролери API
├── Models/         # Моделі даних
├── Services/       # Бізнес-логіка
├── DTO/           # Об'єкти передачі даних
├── Data/          # Контекст бази даних
└── Constants/     # Константи проекту
```

### 2.2 Патерни проектування
- Repository Pattern
- Service Layer Pattern
- Dependency Injection
- DTO Pattern

## 3. Моделі даних

### 3.1 Category (Категорія)
- Базова сутність для класифікації книг
- Містить основні категорії бібліотеки

### 3.2 Subcategory (Підкатегорія)
- Пов'язана з Category
- Детальніша класифікація книг

### 3.3 Book (Книга)
- Основна сутність бібліотеки
- Пов'язана з Category та Subcategory
- Містить інформацію про книги

## 4. API Endpoints

### 4.1 Category API
- GET /api/Category - отримання всіх категорій
- GET /api/Category/{id} - отримання категорії за ID
- POST /api/Category - створення нової категорії
- PUT /api/Category/{id} - оновлення категорії
- DELETE /api/Category/{id} - видалення категорії

### 4.2 Subcategory API
- GET /api/Subcategory - отримання всіх підкатегорій
- GET /api/Subcategory/{id} - отримання підкатегорії за ID
- POST /api/Subcategory - створення нової підкатегорії
- PUT /api/Subcategory/{id} - оновлення підкатегорії
- DELETE /api/Subcategory/{id} - видалення підкатегорії

### 4.3 Books API
- GET /api/Books - отримання всіх книг
- GET /api/Books/{id} - отримання книги за ID
- POST /api/Books - створення нової книги
- PUT /api/Books/{id} - оновлення книги
- DELETE /api/Books/{id} - видалення книги

## 5. Налаштування проекту

### 5.1 Конфігурація бази даних
- Використовується PostgreSQL
- Підключення налаштовується в appsettings.json
- Використовується snake_case для іменування таблиць

### 5.2 CORS налаштування
- Дозволені всі методи (GET, POST, PUT, DELETE)
- Дозволені всі заголовки
- Дозволені всі джерела запитів

### 5.3 Swagger налаштування
- Доступний тільки в режимі розробки
- Автоматична генерація документації API

## 6. Безпека

### 6.1 HTTPS
- Обов'язкове використання HTTPS
- Автоматичне перенаправлення з HTTP на HTTPS

### 6.2 Авторизація
- Базова авторизація через middleware
- Можливість розширення для різних рівнів доступу

## 7. Розгортання

### 7.1 Вимоги
- .NET 8.0 SDK
- PostgreSQL
- Налаштовані змінні середовища

### 7.2 Кроки розгортання
1. Встановити залежності
2. Налаштувати підключення до бази даних
3. Застосувати міграції бази даних
4. Запустити сервер

## 8. Розробка

### 8.1 Локальне середовище
- Використання appsettings.Development.json
- Swagger UI доступний за адресою /swagger
- Автоматичне перезавантаження при змінах

### 8.2 Тестування
- Можливість тестування через Swagger UI
- Підтримка HTTP-клієнтів для тестування API

## 9. Обмеження та особливості

### 9.1 Обмеження
- Максимальний розмір запиту: стандартні обмеження ASP.NET Core
- Обмеження на розмір файлів: налаштовується в конфігурації

### 9.2 Особливості
- Підтримка SPA (Single Page Application)
- Інтеграція з клієнтською частиною через SPA Proxy
- Автоматична генерація API документації 