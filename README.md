# Factory Management System (FMS)

A comprehensive multi-tenant SaaS platform for factory management, designed for manufacturing companies like Sangam Fasteners Pvt Ltd. The system provides role-based access control with Admin, Supervisor, and Employee modules for efficient production management.

## 🏗️ Architecture

- **Frontend**: React.js with TypeScript, Material-UI, Redux Toolkit
- **Backend**: Node.js, Express.js, TypeScript, JWT authentication
- **Database**: MongoDB Atlas with Mongoose ODM
- **Testing**: Jest, React Testing Library
- **DevOps**: Docker, GitHub Actions, Vercel (frontend), Render (backend)
- **Documentation**: Swagger/OpenAPI

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account
- Docker (optional)

### Local Development Setup

1. **Clone and Install Dependencies**
```bash
git clone <repository-url>
cd fms-project

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

2. **Environment Setup**
```bash
# Backend environment
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB connection and JWT secret

# Frontend environment
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your backend API URL
```

3. **Database Setup**
```bash
cd backend
npm run seed
```

4. **Start Development Servers**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm start
```

## 📁 Project Structure

```
fms-project/
├── frontend/                 # React.js frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── modules/        # Role-based modules (Admin, Supervisor, Employee)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── store/          # Redux store configuration
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # Mongoose models
│   │   ├── middleware/     # Custom middleware
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript type definitions
│   ├── scripts/            # Database seeds and migrations
│   └── package.json
├── shared/                  # Shared types and utilities
├── docs/                    # Documentation
├── scripts/                 # Deployment and utility scripts
└── docker-compose.yml       # Docker configuration
```

## 🔐 Authentication & Roles

### Role Hierarchy
1. **Super Admin** (Cascated Solutions) - Global system management
2. **Admin** - Company-level system management
3. **Supervisor** - Production and team oversight
4. **Employee** - Task execution and data entry

### Multi-Tenancy
- Each client company has isolated data
- Tenant isolation through database schemas
- Role-based access control (RBAC)

## 📊 Core Modules

### Admin Module
- User management and role assignment
- System configuration and workflows
- Security settings and audit logs
- Comprehensive reporting and analytics

### Supervisor Module
- Production management and scheduling
- Quality control and inspection oversight
- Inventory management and transfers
- Maintenance scheduling
- Material requisition
- Team management and task assignment

### Employee Module
- Task management and execution
- Production data entry
- Inventory checks and updates
- Quality inspections
- Performance tracking
- Documentation access

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Run all tests
npm run test:all
```

## 🐳 Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Run in production mode
docker-compose -f docker-compose.prod.yml up --build
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect GitHub repository to Vercel
2. Set environment variables
3. Deploy automatically on push to main branch

### Backend (Render)
1. Connect GitHub repository to Render
2. Set environment variables
3. Configure build command: `npm install && npm run build`
4. Configure start command: `npm start`

## 📚 API Documentation

Once the backend is running, visit:
- Swagger UI: `http://localhost:5000/api-docs`
- API Spec: `http://localhost:5000/api-docs.json`

## 🔧 Development Workflow

1. **Feature Development**
   - Create feature branch from `develop`
   - Implement frontend and backend changes
   - Write tests for new functionality
   - Create pull request

2. **Code Quality**
   - ESLint and Prettier for code formatting
   - TypeScript for type safety
   - Jest for unit testing
   - Husky for pre-commit hooks

3. **Deployment Pipeline**
   - GitHub Actions for CI/CD
   - Automated testing on pull requests
   - Staging deployment for testing
   - Production deployment on merge to main

## 📝 Logging

The system includes comprehensive logging:
- Application logs in `logs/` directory
- Error tracking and monitoring
- Audit trails for all user actions
- Performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is proprietary software developed by Cascated Solutions.

## 🆘 Support

For support and questions:
- Email: support@cascatedsolutions.com
- Documentation: `/docs` directory
- API Documentation: Swagger UI when running locally 