# GMTheeVN Backend

Backend API for GMTheeVN, built with Node.js, Express.js and MySQL.

## 1. Setup

```bash
npm.cmd install
cp .env.example .env
```

Open `.env` and update your MySQL credentials.

## 2. Create and update database

```bash
npm.cmd run migrate
```

## 3. Add sample data

```bash
npm.cmd run seed
```

Default accounts after seeding:

- Admin: `admin@gmail.com` / `admin123`
- Artist: `joong@gmail.com` / `artist123`
- User: `user@gmail.com` / `user123`

## 4. Run server

```bash
npm.cmd run dev
```

API base URL:

```text
http://localhost:5000/api
```

## 5. Database migration rule

To update database later, create a new SQL file in `database/migrations`, for example:

```text
016_add_address_to_orders.sql
```

Then run:

```bash
npm run migrate
```

The table `migrations` records which files have already been executed.
