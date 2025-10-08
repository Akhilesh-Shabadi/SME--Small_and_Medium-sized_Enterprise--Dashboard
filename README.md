# SME Real-time Analytics and Collaboration Dashboard

A comprehensive real-time analytics and collaboration dashboard designed specifically for Small and Medium Enterprises (SMEs) to monitor, analyze, and act on real-time data streams including sales, inventory, and customer feedback.

## 🚀 Features

### Core Features
- **Real-time Data Monitoring**: Live updates from POS systems, e-commerce platforms, and customer feedback
- **Interactive Dashboards**: Customizable dashboards with drag-and-drop widgets
- **Team Collaboration**: Real-time comments, task assignment, and team communication
- **Advanced Analytics**: Interactive charts, drill-down capabilities, and data visualization
- **Alert System**: Smart alerts and notifications for critical business metrics
- **Role-based Access Control**: Admin, Manager, and Employee roles with different permissions

### Technical Features
- **Real-time Updates**: WebSocket connections for live data streaming
- **Responsive Design**: Mobile-first approach with modern UI/UX
- **Offline Support**: Cached data and offline functionality
- **Performance Optimized**: Lazy loading, virtualization, and efficient rendering
- **Scalable Architecture**: Microservices-ready with containerization support

## 🏗️ Architecture

### Backend (Node.js + Express)
```
backend/
├── src/
│   ├── config/          # Database and Redis configuration
│   ├── controllers/     # API route handlers
│   ├── middleware/      # Authentication, validation, error handling
│   ├── models/          # Database models (Sequelize)
│   ├── routes/          # API routes
│   ├── services/        # Business logic services
│   ├── socket/          # Socket.IO handlers
│   └── utils/           # Utility functions
├── package.json
└── env.example
```

### Frontend (React + Redux)
```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── contexts/        # React contexts (Socket, Theme)
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Page components
│   ├── services/        # API services
│   ├── store/           # Redux store and slices
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── public/
├── package.json
└── tailwind.config.js
```

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Microsoft SQL Server (MSSQL)
- **ORM**: Sequelize
- **Caching**: Redis
- **Real-time**: Socket.IO
- **Authentication**: JWT
- **Validation**: Express Validator
- **Logging**: Winston
- **Email**: Nodemailer

### Frontend
- **Framework**: React 18
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **Charts**: Recharts, Chart.js, D3.js
- **UI Components**: Headless UI, Heroicons
- **Forms**: React Hook Form
- **Notifications**: React Hot Toast
- **Real-time**: Socket.IO Client
- **HTTP Client**: Axios

### DevOps & Deployment
- **Containerization**: Docker
- **CI/CD**: GitHub Actions
- **Cloud**: AWS/GCP
- **Monitoring**: Winston Logging
- **Security**: Helmet, CORS, Rate Limiting

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Microsoft SQL Server
- Redis Server
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd sme-dashboard
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp env.example .env
   # Configure your .env file with database and Redis credentials
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm start
   ```

4. **Database Setup**
   ```bash
   # Run migrations
   cd backend
   npm run migrate
   
   # Seed initial data
   npm run seed
   ```

### Environment Variables

#### Backend (.env)
```env
# Server Configuration
NODE_ENV=development
PORT=5000
HOST=localhost

# Database Configuration
DB_HOST=localhost
DB_PORT=1433
DB_NAME=sme_dashboard
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
JWT_REFRESH_SECRET=your_refresh_secret_key_here
JWT_REFRESH_EXPIRE=30d

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

## 📊 Data Models

### Core Entities
- **Users**: Authentication and user management
- **Roles**: Role-based access control (Admin, Manager, Employee)
- **Dashboards**: User-created analytics dashboards
- **Widgets**: Individual chart/visualization components
- **Data Sources**: External data integrations (POS, e-commerce, etc.)

### Analytics Data
- **Sales Data**: Transaction records, revenue, product performance
- **Inventory Data**: Stock levels, product information, supplier data
- **Customer Feedback**: Ratings, reviews, sentiment analysis

### Collaboration
- **Comments**: Real-time commenting system
- **Tasks**: Task assignment and tracking
- **Notifications**: Alert and notification system

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Dashboards
- `GET /api/dashboard` - Get all dashboards
- `GET /api/dashboard/:id` - Get single dashboard
- `POST /api/dashboard` - Create dashboard
- `PUT /api/dashboard/:id` - Update dashboard
- `DELETE /api/dashboard/:id` - Delete dashboard
- `POST /api/dashboard/:id/duplicate` - Duplicate dashboard

### Real-time Events (Socket.IO)
- `dashboard:join` - Join dashboard room
- `dashboard:leave` - Leave dashboard room
- `data:subscribe` - Subscribe to data updates
- `comment:create` - Create comment
- `task:create` - Create task
- `alert:acknowledge` - Acknowledge alert

## 🎨 UI Components

### Layout Components
- **Layout**: Main application layout with sidebar and header
- **Sidebar**: Navigation sidebar with menu items
- **Header**: Top header with user menu and notifications

### Dashboard Components
- **DashboardCard**: Individual dashboard preview card
- **Widget**: Reusable chart/visualization widget
- **GridLayout**: Drag-and-drop dashboard grid

### UI Components
- **LoadingSpinner**: Loading state indicator
- **Button**: Styled button component
- **Modal**: Reusable modal dialog
- **Toast**: Notification toast messages

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Granular permissions system
- **Input Validation**: Server-side validation with express-validator
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Protection**: Cross-origin request security
- **SQL Injection Prevention**: Sequelize ORM protection
- **XSS Protection**: Helmet.js security headers

## 📈 Performance Optimizations

### Frontend
- **Code Splitting**: Lazy loading of components
- **Memoization**: React.memo and useMemo for expensive operations
- **Virtual Scrolling**: For large data lists
- **Image Optimization**: Lazy loading and compression
- **Bundle Optimization**: Webpack optimization

### Backend
- **Database Indexing**: Optimized database queries
- **Redis Caching**: Frequently accessed data caching
- **Connection Pooling**: Database connection optimization
- **Compression**: Gzip compression for responses
- **Rate Limiting**: API throttling

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### AWS Deployment
1. **EC2 Instance**: Deploy backend on EC2
2. **RDS**: Managed SQL Server database
3. **ElastiCache**: Redis caching service
4. **S3**: Static file storage
5. **CloudFront**: CDN for frontend assets

### Environment-specific Configuration
- **Development**: Local development with hot reload
- **Staging**: Pre-production testing environment
- **Production**: Optimized production build

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

### E2E Testing
```bash
npm run test:e2e
```

## 📝 Development Guidelines

### Code Style
- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **Conventional Commits**: Commit message format

### Git Workflow
1. Create feature branch from `main`
2. Make changes with proper commits
3. Create pull request for review
4. Merge after approval

### API Documentation
- **Swagger/OpenAPI**: Auto-generated API documentation
- **Postman Collection**: API testing collection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation wiki

## 🔄 Roadmap

### Phase 1 (Current)
- ✅ Basic dashboard functionality
- ✅ Real-time data updates
- ✅ User authentication
- ✅ Basic collaboration features

### Phase 2 (Next)
- 🔄 Advanced analytics and reporting
- 🔄 Mobile application
- 🔄 Advanced alerting system
- 🔄 Data export functionality

### Phase 3 (Future)
- 📋 Machine learning insights
- 📋 Advanced integrations
- 📋 White-label solution
- 📋 Enterprise features

---

**Built with ❤️ for Small and Medium Enterprises**
