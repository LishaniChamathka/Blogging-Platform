# Preview - https://drive.google.com/drive/folders/1y-uzMiI2oGRgvmI0FfV3jm3OITtu7NTU?usp=sharing

# Multi-User Blogging Platform
A modern, full-featured blogging platform built with React.js, Firebase, and Tailwind CSS. This platform supports multiple user roles, rich text editing, authentication, and comprehensive blog management features.

##  Features

### Authentication & Authorization
- **OAuth Integration**: Google & GitHub login via Firebase Authentication
- **Role-Based Access Control**: 
  - **Admin**: Full access to all features, user management, post approval
  - **Editor**: Can create, edit, and delete posts
  - **Reader**: Can view posts, comment, and like content
- **Secure Route Protection**: Routes are protected based on user roles

### Blog Management
- **Rich Text Editor**: Powered by Tip Tap 
- **CRUD Operations**: Create, read, update, and delete blog posts
- **Dynamic Routing**: SEO-friendly URLs using slugs (`/blog/post-title`)
- **Featured Images**: Support for post thumbnails and featured images
- **Categories & Tags**: Organize content with categories and tags
- **Comments System**: Authenticated users can comment on posts
- **Like System**: Users can like 
- **Search & Filter**: Filter posts by category, search by title/content

### Admin Dashboard
- **User Management**: View all users and change their roles
- **Post Management**: Approve, edit, or delete any blog post
- **Analytics Overview**: View user counts

##  Tech Stack
- **Frontend**: React.js 
- **Styling**: Tailwind CSS 
- **Authentication**: Firebase Authentication
- **Database**: Cloud Firestore
- **Rich Text Editor**: Tip Tap
- **Routing**: React Router DOM
- **SEO**: React Helmet
- **Deployment**: Vercel 

##  User Roles & Permissions

### Admin
-  Create, edit, delete any post
-  Manage user roles
-  Access admin dashboard
-  Comment and like posts

### Editor
-  Create, edit, delete own posts
-  Comment and like posts
-  Cannot manage users
-  Cannot access admin dashboard

### Reader (Default)
-  View all posts
-  Comment on posts
-  Like posts
-  Cannot create posts
-  Cannot access admin features
