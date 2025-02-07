This is a Node.js-based application designed to manage startup funding operations. It includes user management, database integration, and templating using EJS.

Features:

User authentication and management
Database connection using MongoDB & Mongoose
EJS templating for dynamic UI rendering
REST API endpoints for handling funding-related data
Project Structure:

startup_funding/
│── dataBase/
│   └── connection.js  # Database connection setup
│── model/schema/
│   ├── users.js       # User schema
│   └── userSchema.js  # Another user schema file
│── views/
│   └── thanks.ejs     # EJS template file
│── cont.js            # Main controller logic
│── old_cont.js        # Old controller logic
│── test.js            # Test script
│── package.json       # Node.js dependencies
│── .gitignore         # Git ignored files
