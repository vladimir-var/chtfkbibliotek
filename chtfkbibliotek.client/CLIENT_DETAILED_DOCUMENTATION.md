# Детальна документація клієнтської частини проекту ЧТФК Бібліотека

## 1. Технічний стек та архітектура

### 1.1 Технології
- **Angular 17.2.0**
  - Компонентна архітектура
  - Декларативний підхід до UI
  - Двостороннє зв'язування даних
  - Шаблони та директиви

- **TypeScript 5.3.3**
  - Строга типізація
  - Інтерфейси та типи
  - Декоратори
  - Generics

- **RxJS 7.8.0**
  - Observable патерн
  - Оператори трансформації
  - Суб'єкти для state management
  - Асинхронні операції

### 1.2 Архітектурні патерни
- **Модульна архітектура**
  - Core Module (ядро додатку)
  - Feature Modules (функціональні модулі)
  - Shared Module (спільні компоненти)
  - Routing Module (маршрутизація)

- **Dependency Injection**
  - Ієрархія інжекторів
  - Сервіси як провайдери
  - Синглтони та фабрики
  - Інжекція залежностей

## 2. Структура проекту

### 2.1 Core Module
```
core/
├── services/           # Сервіси для роботи з API
│   ├── api.service.ts  # Базовий сервіс для HTTP запитів
│   ├── auth.service.ts # Сервіс автентифікації
│   └── ...
├── models/            # Інтерфейси та типи
│   ├── book.model.ts  # Модель книги
│   ├── user.model.ts  # Модель користувача
│   └── ...
└── guards/           # Гварди для захисту маршрутів
    ├── auth.guard.ts # Гвард автентифікації
    └── ...
```

### 2.2 Feature Modules
```
features/
├── admin/            # Адміністративний модуль
│   ├── components/   # Компоненти адмін-панелі
│   ├── services/     # Сервіси адміністрування
│   └── admin.module.ts
├── book-search/      # Модуль пошуку книг
│   ├── components/   # Компоненти пошуку
│   ├── services/     # Сервіси пошуку
│   └── search.module.ts
└── ...
```

### 2.3 Shared Module
```
shared/
├── components/       # Спільні компоненти
│   ├── header/      # Компонент шапки
│   ├── footer/      # Компонент підвалу
│   ├── book-card/   # Картка книги
│   └── sidebar-filter/ # Фільтр в сайдбарі
├── pipes/           # Пайпи для трансформації даних
├── directives/      # Директиви
└── shared.module.ts
```

## 3. Компоненти та їх функціональність

### 3.1 Book Card Component
- Відображення інформації про книгу
- Адаптивний дизайн
- Інтерактивні елементи
- Анімації при наведенні

### 3.2 Sidebar Filter Component
- Фільтрація книг за категоріями
- Динамічне оновлення списку
- Збереження стану фільтрів
- Адаптивний дизайн

### 3.3 Header Component
- Навігаційне меню
- Пошукова строка
- Користувацький профіль
- Адаптивна верстка

## 4. Сервіси та робота з даними

### 4.1 API Service
```typescript
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  // Методи для роботи з API
  get<T>(url: string): Observable<T>
  post<T>(url: string, data: any): Observable<T>
  put<T>(url: string, data: any): Observable<T>
  delete<T>(url: string): Observable<T>
}
```

### 4.2 Book Service
```typescript
@Injectable({
  providedIn: 'root'
})
export class BookService {
  // Методи для роботи з книгами
  getBooks(): Observable<Book[]>
  getBookById(id: number): Observable<Book>
  searchBooks(query: string): Observable<Book[]>
  filterBooks(filters: BookFilters): Observable<Book[]>
}
```

## 5. Маршрутизація

### 5.1 Структура маршрутів
```typescript
const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'books',
    loadChildren: () => import('./features/books/books.module')
      .then(m => m.BooksModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.module')
      .then(m => m.AdminModule),
    canActivate: [AuthGuard]
  }
];
```

### 5.2 Lazy Loading
- Оптимізація завантаження
- Розділення коду
- Автоматична завантаження модулів
- Кешування завантажених модулів

## 6. Стилі та UI

### 6.1 Глобальні стилі
```css
:root {
  --primary-color: #1976d2;
  --secondary-color: #424242;
  --background-color: #f5f5f5;
  --text-color: #333333;
  --spacing-unit: 8px;
}
```

### 6.2 Компонентні стилі
- Скоуповані стилі
- CSS змінні
- Медіа-запити
- Анімації

## 7. Оптимізація та продуктивність

### 7.1 Оптимізація збірки
- Tree shaking
- Code splitting
- Lazy loading
- Мініфікація

### 7.2 Кешування
- Service Worker
- HTTP кешування
- Локальне сховище
- IndexedDB

## 8. Тестування

### 8.1 Unit тести
```typescript
describe('BookService', () => {
  let service: BookService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BookService]
    });
    service = TestBed.inject(BookService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should retrieve books', () => {
    // Тестовий код
  });
});
```

### 8.2 E2E тести
- Protractor
- Cypress
- Тестування користувацьких сценаріїв
- Автоматизація тестів

## 9. Безпека

### 9.1 Аутентифікація
- JWT токени
- HTTP інтерсептори
- Гварди
- Захищені маршрути

### 9.2 Валідація
- Форми з валідацією
- Обробка помилок
- Безпечні HTTP запити
- XSS захист

## 10. Розгортання

### 10.1 Збірка для продакшену
```bash
ng build --prod --aot --optimization
```

### 10.2 Оптимізація
- Мініфікація коду
- Оптимізація зображень
- Gzip стиснення
- Кешування статичних ресурсів 