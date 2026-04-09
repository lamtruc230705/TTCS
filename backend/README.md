# GMTheeVN Backend

## Cài đặt

### 1. Cài đặt Dependencies

```bash
cd backend
npm install
```

### 2. Setup Database MySQL

#### Bước 1: Đảm bảo MySQL Server đang chạy

- MySQL Server phải đang chạy trên máy (default port: 3306)
- Có thể kiểm tra bằng cách mở MySQL Workbench hoặc command line

#### Bước 2: Tạo Database

Chạy một trong các cách sau:

**Cách 1: Sử dụng MySQL Command Line**

```bash
# Mở MySQL command line
mysql -u root -p

# Chạy lệnh tạo database
CREATE DATABASE IF NOT EXISTS store_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Thoát MySQL
exit;
```

**Cách 2: Import file SQL**

```bash
# Import schema từ file DB/store_db.sql
mysql -u root -p < ../DB/store_db.sql
```

**Cách 3: Sử dụng MySQL Workbench**

1. Mở MySQL Workbench
2. Connect đến MySQL Server
3. Mở file `../DB/store_db.sql`
4. Run script để tạo database và tables

### 3. Cấu hình Environment Variables

File `.env` đã có sẵn với cấu hình mặc định:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=thuong230705
DB_NAME=store_db

JWT_SECRET=super_secret_key
```

**⚠️ Quan trọng:**

- Thay đổi `DB_PASSWORD` nếu mật khẩu MySQL của bạn khác
- Đảm bảo `DB_NAME=store_db` khớp với database đã tạo

### 4. Chạy Server

```bash
# Development mode (tự động restart khi file thay đổi)
npm run dev

# Production mode
npm start
```

**Output mong đợi khi server khởi động thành công:**

```
✓ Database connected successfully
Server is running at http://localhost:3000
Test API: http://localhost:3000/test
```

### 5. Kiểm tra kết nối Database

Sau khi server chạy, test API để đảm bảo database hoạt động:

```bash
# Test server
curl http://localhost:3000/test

# Test register (kiểm tra database write)
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@test.com","password":"123456","phone":"0123456789"}'

# Test login (kiểm tra database read)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"123456"}'
```

## Troubleshooting Database

### Lỗi: "Database connection failed"

```
✓ Kiểm tra MySQL Server có đang chạy không
✓ Kiểm tra credentials trong .env
✓ Kiểm tra database 'store_db' có tồn tại không
✓ Kiểm tra firewall không block port 3306
```

### Lỗi: "Port 3000 already in use"

```bash
# Tìm process đang dùng port 3000
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <PID> /F
```

### Lỗi: "Cannot find module 'mysql2'"

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Cấu trúc Database

Database `store_db` bao gồm các bảng chính sau:

### Core Tables

- **Users**: Thông tin người dùng (user, artist, admin)
- **Artists**: Thông tin nghệ sĩ (liên kết với Users)
- **ArtistSocialLinks**: Liên kết mạng xã hội của nghệ sĩ

### Product & Commerce

- **ProductCategories**: Danh mục sản phẩm
- **Products**: Thông tin sản phẩm
- **Carts**: Giỏ hàng của user
- **CartItems**: Chi tiết items trong giỏ hàng
- **Orders**: Đơn hàng
- **OrderItems**: Chi tiết sản phẩm trong đơn hàng

### Additional Features

- **Payments**: Thông tin thanh toán
- **ShippingAddresses**: Địa chỉ giao hàng
- **Reviews**: Đánh giá sản phẩm
- **AuditLogs**: Nhật ký hoạt động

### Database Schema

File schema đầy đủ: `../DB/store_db.sql`

**Các bảng quan trọng:**

- `Users` ↔ `Artists` (1-1 relationship)
- `Users` ↔ `Carts` (1-1 relationship)
- `Products` ↔ `Artists` (Many-1 relationship)
- `Orders` ↔ `Users` (Many-1 relationship)
- `OrderItems` ↔ `Orders` & `Products` (Many-Many relationship)

## Import Postman Collection

Để test API dễ dàng, import cả Collection và Environment vào Postman.

### Cách import:

1. **Mở Postman**
2. **Import Collection:**
   - Click "Import" → "File"
   - Chọn file `GMTheeVN_Postman_Collection.json`
3. **Import Environment:**
   - Click "Import" → "File"
   - Chọn file `GMTheeVN_Postman_Environment.json`
4. **Chọn Environment:**
   - Góc trên bên phải, chọn "GMTheeVN Local Environment" từ dropdown

### Environment Variables:

| Variable    | Value                   | Description                       |
| ----------- | ----------------------- | --------------------------------- |
| `baseUrl`   | `http://localhost:3000` | URL của backend server            |
| `token`     | _(auto-filled)_         | JWT token sau khi login           |
| `user_id`   | _(auto-filled)_         | ID của user hiện tại              |
| `user_role` | _(auto-filled)_         | Role của user (user/artist/admin) |

### Test Scripts:

Collection có sẵn test scripts để:

- **Tự động lưu token** sau khi login thành công
- **Log response** để debug
- **Set environment variables** từ response

### 📖 Chi tiết: Xem file [POSTMAN_GUIDE.md](POSTMAN_GUIDE.md) để có hướng dẫn đầy đủ.

## Test với Postman

### API Status Overview:

| Module       | Status          | Working APIs            | Notes                      |
| ------------ | --------------- | ----------------------- | -------------------------- |
| **Auth**     | ✅ **Working**  | Register, Login, Get Me | Hoạt động đầy đủ với MySQL |
| **Products** | ⚠️ **Disabled** | -                       | Cần convert MSSQL → MySQL  |
| **Artists**  | ⚠️ **Disabled** | -                       | Cần convert MSSQL → MySQL  |
| **Cart**     | ⚠️ **Disabled** | -                       | Cần convert MSSQL → MySQL  |
| **Orders**   | ⚠️ **Disabled** | -                       | Cần convert MSSQL → MySQL  |
| **Admin**    | ⚠️ **Disabled** | -                       | Cần convert MSSQL → MySQL  |

### Quick Start Testing:

1. **Test Server:**

   ```
   GET {{baseUrl}}/test
   ```

   Expected: `{"success":true,"message":"Server is running"}`

2. **Register User:**

   ```
   POST {{baseUrl}}/api/auth/register
   Body: {
     "username": "testuser123",
     "email": "test123@gmail.com",
     "password": "password123",
     "phone": "0123456789"
   }
   ```

3. **Login (Token sẽ được tự động lưu):**

   ```
   POST {{baseUrl}}/api/auth/login
   Body: {
     "email": "test123@gmail.com",
     "password": "password123"
   }
   ```

4. **Test Protected API:**
   ```
   GET {{baseUrl}}/api/auth/me
   Headers: Authorization: Bearer {{token}}
   ```

### Collection Structure:

```
GMTheeVN Backend API/
├── 1. Test Server/
│   └── GET /test
├── 2. Authentication (✅ Working)/
│   ├── POST /api/auth/register
│   ├── POST /api/auth/login
│   └── GET /api/auth/me
├── 3. Products (⚠️ Disabled)/
│   ├── GET /api/products
│   └── GET /api/products/:id
├── 4. Artists (⚠️ Disabled)/
│   ├── GET /api/artists
│   └── GET /api/artists/:id
├── 5. Cart & Orders (⚠️ Disabled)/
│   ├── GET /api/cart/my-cart
│   └── POST /api/cart/items
└── 6. Admin APIs (⚠️ Disabled)/
    ├── GET /api/admin/dashboard
    └── GET /api/admin/users
```

### Troubleshooting Postman:

#### Lỗi: "Could not get any response"

- ✅ Kiểm tra server có chạy: `http://localhost:3000/test`
- ✅ Kiểm tra environment variables
- ✅ Kiểm tra URL có đúng format

#### Lỗi: "401 Unauthorized"

- ✅ Kiểm tra đã login và có token chưa
- ✅ Kiểm tra token có trong header: `Authorization: Bearer {{token}}`

#### Lỗi: "404 Not Found"

- ✅ Kiểm tra URL có prefix `/api/` không
- ✅ Kiểm tra API đó có bị disabled không (nhìn status trong collection)

#### Lỗi: "500 Internal Server Error"

- ✅ Kiểm tra database connection
- ✅ Kiểm tra logs server trong terminal
- ✅ Có thể API đang dùng MSSQL syntax (cần convert)

### Tips:

- **Auto-save token**: Sau khi login thành công, token sẽ tự động được lưu vào environment
- **Check response**: Mở tab "Console" trong Postman để xem logs
- **Test scripts**: Collection có sẵn scripts để tự động xử lý response
- **Environment**: Luôn chọn đúng environment "GMTheeVN Local Environment"

## Test với Postman

Backend hiện tại chạy với database MySQL, bạn có thể kiểm tra các API sau:

### API Status

| Module               | Status      | Notes                            |
| -------------------- | ----------- | -------------------------------- |
| **Auth**             | ✅ Working  | Register, Login hoạt động đầy đủ |
| **Home**             | ⚠️ Disabled | Tạm comment để tránh lỗi         |
| **Artists (Public)** | ⚠️ Disabled | Tạm comment để tránh lỗi         |
| **Products**         | ⚠️ Disabled | Tạm comment để tránh lỗi         |
| **Cart**             | ⚠️ Disabled | Tạm comment để tránh lỗi         |
| **Orders**           | ⚠️ Disabled | Tạm comment để tránh lỗi         |
| **Artist Profile**   | ⚠️ Disabled | Tạm comment để tránh lỗi         |
| **Admin**            | ⚠️ Disabled | Tạm comment để tránh lỗi         |

**✅ APIs đang hoạt động:**

- `GET /test` - Kiểm tra server
- `POST /api/auth/register` - Đăng ký
- `POST /api/auth/login` - Đăng nhập

**⚠️ APIs tạm disabled:**
Các routes khác đã được comment trong `app.js` để tránh lỗi MSSQL → MySQL conversion. Khi cần sử dụng, cần sửa lại syntax trong controllers.

### Base URL

```
http://localhost:3000
```

### Kiểm tra server

- **GET** `/test`
  - Response: `{"success":true,"message":"Server is running"}`

### 1. Authentication APIs (/api/auth)

- **POST** `/api/auth/register` - Đăng ký user

  ```json
  {
    "username": "testuser",
    "email": "test@test.com",
    "phone": "123456789",
    "password": "123456",
    "confirmPassword": "123456"
  }
  ```

- **POST** `/api/auth/login` - Đăng nhập

  ```json
  {
    "email": "test@test.com",
    "password": "123456"
  }
  ```

  - Response trả về `token` và `role`

- **GET** `/api/auth/me` - Lấy thông tin người dùng hiện tại
  - Headers: `Authorization: Bearer <token>`

### 2. Public APIs (Không cần auth)

#### Home (/api/home)

- **GET** `/api/home/summary` - Dữ liệu trang chủ

#### Artists (/api/artists)

- **GET** `/api/artists` - Danh sách tất cả artists
- **GET** `/api/artists/:id` - Chi tiết artist
- **GET** `/api/artists/:id/products` - Sản phẩm của artist

#### Products (/api/products)

- **GET** `/api/products` - Danh sách sản phẩm
  - Query params: `?keyword=search&artist_id=1`
- **GET** `/api/products/:id` - Chi tiết sản phẩm

### 3. User APIs (Cần auth + role `user`)

#### Cart (/api/cart)

- **GET** `/api/cart` - Xem giỏ hàng
- **POST** `/api/cart/add` - Thêm sản phẩm vào giỏ
  ```json
  {
    "product_id": 1,
    "quantity": 2
  }
  ```
- **PUT** `/api/cart/item/:itemId` - Cập nhật số lượng item trong giỏ
  ```json
  {
    "quantity": 3
  }
  ```
- **DELETE** `/api/cart/item/:itemId` - Xóa item khỏi giỏ

#### Orders (/api/orders)

- **POST** `/api/orders/checkout` - Thanh toán đơn hàng
- **GET** `/api/orders/my-orders` - Lấy lịch sử đơn hàng của user

#### User profile (/api/user)

- **GET** `/api/user/me` - Lấy profile của người dùng hiện tại
- **PUT** `/api/user/me` - Cập nhật profile của người dùng hiện tại

### 4. Artist APIs (Cần auth + role `artist`)

#### Artist Profile (/api/artist/me)

- **GET** `/api/artist/me/profile` - Xem profile artist
- **PUT** `/api/artist/me/profile` - Cập nhật profile artist
  ```json
  {
    "stage_name": "New Name",
    "bio": "Updated bio"
  }
  ```
- **GET** `/api/artist/me/products` - Xem sản phẩm của artist hiện tại

#### Artist Orders (/api/artist/me/orders)

- **GET** `/api/artist/me/orders` - Danh sách đơn hàng của artist
- **GET** `/api/artist/me/orders/:id` - Chi tiết đơn hàng
- **PATCH** `/api/artist/me/orders/:id/status` - Cập nhật trạng thái đơn hàng
  ```json
  {
    "status": "shipped"
  }
  ```

#### Artist Schedule (/api/artist/me/schedules)

- **GET** `/api/artist/me/schedules` - Xem lịch trình
- **POST** `/api/artist/me/schedules` - Tạo lịch trình mới
  ```json
  {
    "title": "Concert",
    "date": "2024-12-25",
    "location": "Hanoi"
  }
  ```

#### Artist Revenue (/api/artist/me/revenue)

- **GET** `/api/artist/me/revenue/summary` - Thống kê doanh thu

### 5. Admin APIs (Cần auth + role `admin`)

#### Dashboard (/api/admin/dashboard)

- **GET** `/api/admin/dashboard` - Thống kê tổng quan

#### Admin revenue (/api/admin/revenue)

- **GET** `/api/admin/revenue` - Thống kê doanh thu admin

#### Users (/api/admin/users)

- **GET** `/api/admin/users` - Danh sách users
- **GET** `/api/admin/users/:id` - Chi tiết user

#### Artists (/api/admin/artists)

- **GET** `/api/admin/artists` - Danh sách artists
- **PATCH** `/api/admin/artists/:id/status` - Thay đổi trạng thái artist
  ```json
  {
    "status": "active"
  }
  ```

#### Products (/api/admin/products)

- **GET** `/api/admin/products` - Danh sách sản phẩm
- **PATCH** `/api/admin/products/:id/status` - Thay đổi trạng thái sản phẩm
  ```json
  {
    "status": "active"
  }
  ```

#### Orders (/api/admin/orders)

- **GET** `/api/admin/orders` - Danh sách đơn hàng
- **PATCH** `/api/admin/orders/:id/status` - Cập nhật trạng thái đơn hàng
  ```json
  {
    "status": "shipped"
  }
  ```

### Lưu ý quan trọng

- **Luôn sử dụng prefix `/api/`** trong URL.
- Các API cần auth phải dùng header: `Authorization: Bearer <token>`.
- Nếu role không đúng, server sẽ trả về `403 Forbidden`.
- Nếu endpoint sai, server trả về `404 Not Found`.
- Đang chạy mock data, không cần database.
- Để dùng dữ liệu thực, bật lại cấu hình DB và khởi động SQL Server.

## API Endpoints Summary

- **Auth**: /api/auth (register, login, me)
- **Home**: /api/home (summary)
- **Artists**: /api/artists (public list/detail/products)
- **Products**: /api/products (list/detail)
- **Cart**: /api/cart (user cart operations)
- **Orders**: /api/orders (user checkout/history)
- **Artist Self**: /api/artist/me (profile, products, schedules, revenue)
- **Admin**: /api/admin (dashboard, users, artists, products, orders)

## Development Workflow

### Thêm API mới

1. **Tạo Controller** trong `src/controllers/`
2. **Tạo Route** trong `src/routes/`
3. **Import route** vào `src/app.js`
4. **Test API** với Postman

### Sửa lỗi MSSQL → MySQL

Các controllers hiện tại sử dụng MSSQL syntax. Để enable lại:

1. Mở file controller cần sửa
2. Thay `connectDB().request().input()` thành `pool.query()` với prepared statements
3. Thay `GETDATE()` thành `NOW()`
4. Thay `ISNULL()` thành `IFNULL()`
5. Uncomment route trong `app.js`

### Scripts có sẵn

```bash
# Development (auto-restart)
npm run dev

# Production
npm start

# Chỉ chạy server (không auto-restart)
node src/server.js
```

### Project Structure

```
backend/
├── src/
│   ├── app.js              # Express app & routes
│   ├── server.js           # Server entry point
│   ├── configs/
│   │   ├── db.js          # Database connection
│   │   └── env.js         # Environment config
│   ├── controllers/        # Business logic
│   ├── services/           # Business services
│   ├── repositories/       # Database queries
│   ├── routes/             # API routes
│   ├── middlewares/        # Custom middlewares
│   ├── utils/              # Helper functions
│   └── validators/         # Input validation
├── .env                    # Environment variables
├── package.json           # Dependencies
└── README.md
```

## Contributing

1. Fork repository
2. Tạo feature branch: `git checkout -b feature/new-api`
3. Commit changes: `git commit -m 'Add new API'`
4. Push to branch: `git push origin feature/new-api`
5. Tạo Pull Request

## License

This project is licensed under the MIT License.
