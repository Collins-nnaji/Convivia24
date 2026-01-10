# Development Mode

The application is currently configured to run in **Development Mode**, which allows you to:

1. **Browse all pages without authentication** - No login required to view functionality
2. **Switch between user roles** - Use the role switcher in the sidebar to see different views (client, staff, supervisor, admin)
3. **View mock data** - When the database is not connected, the app will show realistic mock data
4. **Test all features** - All CRUD operations work with mock data

## How to Disable Dev Mode

When you're ready to require authentication:

1. **In `app/(app)/layout.jsx`**: Change `DEV_MODE` from `true` to:
   ```jsx
   const DEV_MODE = process.env.NODE_ENV === 'development';
   ```

2. **In `lib/auth.js`**: Change `DEV_MODE` from `true` to:
   ```js
   const DEV_MODE = process.env.NODE_ENV === 'development';
   ```

3. **Set up your database**: Make sure `DATABASE_URL` is set in your environment variables

4. **Create user accounts**: Use the registration endpoint or seed the database with test users

## Current Features Available Without Login

- ✅ View all dashboards (Client, Admin, Staff, Supervisor)
- ✅ Browse services catalog
- ✅ View job listings and details
- ✅ See invoices and compliance logs
- ✅ Switch between role views using the sidebar dropdown
- ✅ All API endpoints return mock data when database is not connected

## Database Connection

The app will automatically use mock data when:
- `DATABASE_URL` environment variable is not set
- Database connection fails
- `sql` is null

When the database is connected, all API endpoints will use real data from your Neon PostgreSQL database.
