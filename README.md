postman API documentation : https://documenter.getpostman.com/view/45702516/2sB3BDJAbK

# BookVerse API

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express.js" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript ES6+" />
</p>

<p align="center">
  <strong>A robust RESTful API for managing books, authors, and activity logs with comprehensive CRUD operations, built with Node.js, Express.js, and MongoDB.</strong>
</p>

## 📚 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Environment Setup](#environment-setup)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Project Structure](#project-structure)
- [Development](#development)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Logging System](#logging-system)
- [Best Practices](#best-practices)
- [Contributing](#contributing)
- [License](#license)

## 🔍 Overview

BookVerse is a production-ready RESTful API designed for managing a comprehensive book catalog system. It provides a clean, scalable architecture with robust data validation, comprehensive logging, and efficient database operations using MongoDB with proper indexing strategies.

### Key Highlights

- **Scalable Architecture**: Modular design with separation of concerns
- **Advanced MongoDB Integration**: Schema validation, indexing, and aggregation pipelines
- **Comprehensive Logging**: Automated activity tracking with capped collections
- **Production Ready**: Rate limiting, error handling, and security best practices
- **Factory Pattern Services**: Reusable and testable service layer architecture
- **RESTful Design**: Consistent API patterns with proper HTTP status codes

## ✨ Features

### Core Functionality
- 📖 **Book Management**: Complete CRUD operations for books with metadata
- 👤 **Author Management**: Author profiles with biographical information
- 📊 **Activity Logging**: Comprehensive audit trail of all operations
- 🔍 **Advanced Querying**: Pagination, sorting, and filtering capabilities
- 📝 **Bulk Operations**: Efficient batch processing for multiple records

### Technical Features
- 🛡️ **Schema Validation**: MongoDB schema validation with BSON types
- 🚀 **Performance Optimized**: Strategic database indexing and query optimization
- 🔄 **Rate Limiting**: Request throttling to prevent abuse
- 📈 **Pagination**: Efficient data retrieval with skip/limit patterns
- 🎯 **Error Handling**: Consistent error responses with detailed messaging
- 🏗️ **Modular Architecture**: Clean separation of routes, controllers, and services

## 🏗️ Architecture

```
BookVerse API
├── 🌐 REST API Layer (Express.js)
├── 🎮 Controller Layer (Business Logic)
├── 🔧 Service Layer (Factory Pattern)
├── 🗄️ Data Layer (MongoDB with Validation)
└── 📊 Logging Layer (Activity Audit)
```

### Design Patterns
- **Factory Pattern**: Service layer instantiation
- **Repository Pattern**: Data access abstraction
- **Middleware Pattern**: Request processing pipeline
- **MVC Architecture**: Clear separation of concerns

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB (v6+)
- npm or yarn


## ⚙️ Environment Setup

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/bookverse
DB_NAME=bookverse

# Rate Limiting (optional)
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100   # Max requests per window
```

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `PORT` | Server port | No | 3000 |
| `MONGODB_URI` | MongoDB connection string | Yes | - |
| `DB_NAME` | Database name | Yes | - |
| `NODE_ENV` | Environment mode | No | development |

## 📋 API Documentation

**Base URL**: `http://localhost:3000/api`

**Postman Collection**: [BookVerse API Documentation](https://documenter.getpostman.com/view/45702516/2sB3BDJAbK)

### Authors Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/authors` | Create a new author |
| `GET` | `/authors` | Get all authors with pagination |
| `GET` | `/authors/:id` | Get author by ID |
| `GET` | `/authors/:id/books` | Get author with their books |
| `PATCH` | `/authors/:id` | Update author information |

### Books Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/books` | Create a new book |
| `POST` | `/books/bulk` | Create multiple books |
| `GET` | `/books` | Get all books with pagination |
| `GET` | `/books/:id` | Get book by ID |
| `GET` | `/books/:id/author` | Get book with author details |
| `PATCH` | `/books/update/:id` | Update book information |
| `DELETE` | `/books/delete/:id` | Delete a book |

### Logs Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/logs` | Get all activity logs |
| `GET` | `/logs/:id` | Get specific log entry |

### Query Parameters

#### Pagination & Sorting
```
GET /api/books?skip=0&limit=10&sort=title
GET /api/books?sort=-createdAt  # Descending order
```

#### Supported Sort Fields
- **Books**: `createdAt`, `title`, `year`
- **Authors**: `name`, `age`, `createdAt`
- **Logs**: `timestamp`, `action`, `entityType`

### Request/Response Examples

#### Create Author
```json
POST /api/authors
{
  "name": "J.K. Rowling",
  "bio": "British author best known for the Harry Potter series"
}
```

#### Create Book
```json
POST /api/books
{
  "title": "Harry Potter and the Philosopher's Stone",
  "authorId": "64a7b8c9d1e2f3a4b5c6d7e8",
  "year": 1997,
  "genre": ["Fantasy", "Young Adult"],
  "summary": "A young wizard's journey begins..."
}
```

#### Bulk Create Books
```json
POST /api/books/bulk
[
  {
    "title": "Book One",
    "authorId": "64a7b8c9d1e2f3a4b5c6d7e8",
    "year": 2020
  },
  {
    "title": "Book Two",
    "authorId": "64a7b8c9d1e2f3a4b5c6d7e8",
    "year": 2021
  }
]
```

## 🗄️ Database Schema

### Collections Overview

#### Authors Collection
```javascript
{
  _id: ObjectId,
  name: String (required, min: 1),
  bio: String (optional),
  age: Number (optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

#### Books Collection
```javascript
{
  _id: ObjectId,
  title: String (required, min: 1),
  authorId: ObjectId (required, references authors._id),
  year: Number (optional, 1000 <= year <= current year),
  genre: Array<String> (optional),
  summary: String (optional),
  createdAt: Date (required),
  updatedAt: Date (required)
}
```

#### Logs Collection (Capped)
```javascript
{
  _id: ObjectId,
  action: String (enum: 'create', 'update', 'delete'),
  entityType: String (enum: 'book', 'author'),
  entityId: ObjectId,
  timestamp: Date (required)
}
```

### Database Indexes

```javascript
// Authors
db.authors.createIndex({ "name": 1 })

// Books
db.books.createIndex({ "authorId": 1 })
db.books.createIndex({ "title": "text" })
db.books.createIndex({ "genres": 1 })

// Logs (capped collection with 1MB size limit, max 1000 documents)
```

### Schema Validation

The API implements MongoDB schema validation with strict BSON type checking:

- **Required Field Validation**: Ensures critical fields are present
- **Type Safety**: Validates data types (string, number, ObjectId, date)
- **Range Constraints**: Year validation, string length requirements
- **Reference Integrity**: Validates author existence for books

## 📁 Project Structure

```
bookverse/
├── 📄 .env                              # Environment variables
├── 📄 .gitignore                        # Git ignore rules
├── 📄 .prettierrc.js                    # Code formatting config
├── 📄 package.json                      # Dependencies and scripts
├── 📄 README.md                         # Project documentation
├── 📁 src/
│   ├── 📁 DB/
│   │   ├── 📄 dbConnection.js           # Database connection logic
│   │   ├── 📄 services.connection.js   # Service layer initialization
│   │   └── 📁 Models/
│   │       ├── 📄 author.model.js       # Author schema & collection setup
│   │       ├── 📄 book.model.js         # Book schema & collection setup
│   │       └── 📄 log.model.js          # Logging schema & collection setup
│   ├── 📁 Middlewares/
│   │   ├── 📄 auth.middleware.js        # Authentication middleware (placeholder)
│   │   └── 📄 validateRequest.middleware.js # Request validation (placeholder)
│   ├── 📁 Modules/
│   │   ├── 📁 Authors/
│   │   │   ├── 📄 author.controller.js  # Author business logic
│   │   │   ├── 📄 author.routes.js      # Author route definitions
│   │   │   └── 📄 author.service.js     # Author data access layer
│   │   ├── 📁 Books/
│   │   │   ├── 📄 book.controller.js    # Book business logic
│   │   │   ├── 📄 book.routes.js        # Book route definitions
│   │   │   └── 📄 book.service.js       # Book data access layer
│   │   └── 📁 Logs/
│   │       ├── 📄 log.controller.js     # Log business logic
│   │       ├── 📄 log.routes.js         # Log route definitions
│   │       └── 📄 log.service.js        # Log data access layer
│   ├── 📁 Utils/
│   │   └── 📄 responseHandler.utils.js  # Consistent API responses
│   └── 📄 index.js                      # Application entry point
```

### Architecture Principles

- **Modular Design**: Each entity (Authors, Books, Logs) has its own module
- **Separation of Concerns**: Clear distinction between routes, controllers, and services
- **Factory Pattern**: Services are created using factory functions for better testability
- **Consistent Structure**: Each module follows the same organizational pattern

## 🛠️ Development

### Available Scripts

```bash
# Start production server
npm start

# Start development server with auto-reload
npm run dev

# Install dependencies
npm install
```

### Development Guidelines

1. **ES6+ Modules**: Use import/export syntax
2. **Async/Await**: Prefer async/await over promises
3. **Error Handling**: Always use try-catch blocks
4. **Validation**: Validate input at controller level
5. **Logging**: Use the built-in logging system for audit trails

## 🔒 Rate Limiting

The API implements rate limiting to prevent abuse:

```javascript
// Configuration
windowMs: 15 * 60 * 1000, // 15 minutes
max: 100                   // 100 requests per window
```

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

## ❌ Error Handling

### Consistent Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error message",
  "error": {
    "name": "ErrorType",
    "message": "Detailed error description",
    "details": "Additional context (optional)"
  }
}
```

### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (validation errors) |
| `404` | Not Found |
| `500` | Internal Server Error |

### Common Error Scenarios

- **Validation Errors**: Invalid input data, missing required fields
- **Resource Not Found**: Non-existent IDs, empty result sets
- **Reference Errors**: Invalid author references, constraint violations
- **Database Errors**: Connection issues, operation failures

## 📊 Logging System

### Automated Activity Tracking

The system automatically logs all CUD (Create, Update, Delete) operations:

```javascript
// Log Entry Structure
{
  action: 'create' | 'update' | 'delete',
  entityType: 'book' | 'author',
  entityId: ObjectId,
  timestamp: Date
}
```

### Capped Collection Benefits

- **Fixed Size**: 1MB storage limit prevents unlimited growth
- **High Performance**: Optimized for high-frequency writes
- **Automatic Cleanup**: Oldest entries are automatically removed
- **Audit Trail**: Maintains recent activity history

### Log Query Examples

```javascript
// Get recent activity
GET /api/logs?sort=-timestamp&limit=50

// Get specific entity logs
GET /api/logs?entityType=book&entityId=64a7b8c9d1e2f3a4b5c6d7e8
```

## 🏆 Best Practices

### Security
- **Input Validation**: Strict validation of all inputs
- **Rate Limiting**: Protection against abuse
- **Error Messages**: No sensitive information exposure
- **ObjectId Validation**: Prevents injection attacks

### Performance
- **Database Indexing**: Strategic indexes for common queries
- **Pagination**: Efficient data retrieval patterns
- **Connection Pooling**: MongoDB connection optimization
- **Aggregation Pipelines**: Optimized multi-collection queries

### Code Quality
- **Factory Pattern**: Testable service layer
- **Error Boundaries**: Comprehensive error handling
- **Consistent API**: Uniform response formats
- **Documentation**: Comprehensive inline documentation

### Database Design
- **Schema Validation**: MongoDB-level data integrity
- **Referential Integrity**: Proper foreign key handling
- **Capped Collections**: Efficient logging with automatic cleanup
- **Aggregation**: Complex queries using MongoDB aggregation framework

### Testing Checklist

- [ ] All CRUD operations work correctly
- [ ] Validation rules are enforced
- [ ] Error handling covers edge cases
- [ ] Pagination and sorting function properly
- [ ] Activity logging is triggered appropriately
- [ ] Rate limiting doesn't break functionality

## 📞 Support

### API Documentation
- **Postman Collection**: [View API Documentation](https://documenter.getpostman.com/view/45702516/2sB3BDJAbK)
- **Interactive Testing**: Import the Postman collection for hands-on testing

### Common Issues

1. **Connection Errors**: Verify MongoDB URI and database connectivity
2. **Validation Failures**: Check request body format and required fields
3. **Rate Limit Exceeded**: Wait for rate limit window to reset
4. **ObjectId Invalid**: Ensure proper ObjectId format (24-character hex string)

### Getting Help

- Check the Postman documentation for API usage examples
- Review error messages for specific guidance
- Ensure all environment variables are properly configured
- Verify MongoDB instance is running and accessible

---

<p align="center">
  <strong>Built with ❤️ for the book-loving developer community</strong>
</p>

<p align="center">
  <sub>BookVerse API - Empowering literary applications with robust backend infrastructure</sub>
</p>
