# API Documentation

## Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration  
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Trucks
- `GET /api/trucks` - Get all trucks
- `GET /api/trucks/:id` - Get truck by ID
- `POST /api/trucks` - Create new truck
- `PUT /api/trucks/:id` - Update truck
- `DELETE /api/trucks/:id` - Delete truck

### Trips
- `GET /api/trips` - Get all trips
- `GET /api/trips/:id` - Get trip by ID
- `POST /api/trips` - Create new trip
- `PUT /api/trips/:id` - Update trip

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID

### Maintenance
- `GET /api/maintenance` - Get all maintenance records
- `GET /api/maintenance/:id` - Get maintenance record by ID
- `POST /api/maintenance` - Create maintenance record
