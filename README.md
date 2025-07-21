# AutoDoc AI - Tata Vehicle Service Platform

Built for **Tata Innovent 2026** - A comprehensive AI-powered vehicle service management platform specifically designed for Tata Motors vehicles.

## 🚗 Overview

AutoDoc AI revolutionizes vehicle service management by connecting Tata vehicle owners with intelligent AI assistance and providing service providers with comprehensive analytics insights.

## ✨ Key Features

### For Vehicle Owners
- **Voice Issue Reporting**: Report vehicle problems using voice messages
- **AI-Powered Issue Processing**: Automatic formatting and categorization of issues
- **Issue Tracking**: Complete history of repairs and maintenance
- **AI Assistant Chatbot**: Instant help with vehicle-related queries
- **Tata Model Support**: Specialized support for all Tata vehicle models

### For Service Providers
- **Analytics Dashboard**: Comprehensive data insights on vehicle issues
- **Vehicle Flaw Analysis**: Identify common problems across Tata models
- **Performance Trends**: Monthly and yearly service trends
- **Issue Categorization**: Detailed breakdown by vehicle model and issue type

## 🛠 Technology Stack

- **Frontend**: Next.js 13, React, TypeScript
- **UI Components**: shadcn/ui, Tailwind CSS
- **Authentication**: NextAuth.js
- **Database**: MongoDB
- **AI Processing**: Voice-to-text and issue formatting
- **Charts**: Recharts for analytics visualization

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- MongoDB database (local or cloud)
- Modern web browser with microphone support

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd autodoc-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   MONGODB_URI=your-mongodb-connection-string
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-key
   OPENAI_API_KEY=your-openai-key (optional)
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 User Types

### Vehicle Owner Registration
- Register with Tata vehicle details (model, year, registration)
- Only Tata models are supported
- Complete profile with contact information

### Service Provider Access
- Register as authorized Tata service provider
- Access to comprehensive analytics dashboard
- Company and location verification

## 🎯 Core Functionality

### Issue Reporting Workflow
1. **Voice/Text Input**: Users describe vehicle issues
2. **AI Processing**: Automatic transcription and formatting
3. **Categorization**: AI assigns category and severity
4. **Suggestions**: Recommended actions provided
5. **Tracking**: Issues stored in user history
6. **Resolution**: Users can mark issues as resolved

### Analytics Features
- **Issue Distribution**: By vehicle model and category
- **Trend Analysis**: Monthly and yearly patterns
- **Common Flaws**: Frequently reported problems
- **Severity Tracking**: Critical vs. minor issues

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login

### Issues Management
- `POST /api/issues` - Create new issue
- `GET /api/issues` - Fetch user issues
- `PATCH /api/issues/[id]` - Update issue status

### User Profile
- `GET /api/profile` - Fetch user profile data

## 🎨 Design Features

- **Tata Brand Colors**: Professional blue and orange theme
- **Responsive Design**: Optimized for mobile and desktop
- **Voice Interface**: Intuitive voice recording UI
- **Modern UI**: Clean, professional interface
- **Accessibility**: WCAG compliant design

## 📊 Analytics Dashboard

Service providers get access to:
- Total issues and resolution rates
- Issues by vehicle model (Nexon, Harrier, Tiago, etc.)
- Category-wise issue distribution
- Monthly trend analysis
- Common vehicle flaws identification

## 🔐 Security Features

- Secure authentication with NextAuth.js
- Password hashing with bcrypt
- Protected API routes
- User type-based access control
- MongoDB security best practices

## 🌟 AI Capabilities

- **Voice-to-Text**: Convert voice messages to text
- **Issue Formatting**: AI-powered issue description enhancement
- **Category Assignment**: Automatic issue categorization
- **Severity Assessment**: Risk level evaluation
- **Solution Suggestions**: Recommended actions

## 📝 Database Schema

### Users Collection
```javascript
{
  name: String,
  email: String,
  password: String (hashed),
  phone: String,
  userType: 'vehicle_owner' | 'service_provider',
  vehicleModel: String, // For vehicle owners
  vehicleYear: Number,
  vehicleRegistration: String,
  companyName: String, // For service providers
  serviceLocation: String
}
```

### Issues Collection
```javascript
{
  userId: ObjectId,
  description: String,
  category: String,
  severity: 'low' | 'medium' | 'high',
  suggestedActions: [String],
  vehicleModel: String,
  status: 'open' | 'resolved',
  createdAt: Date,
  resolvedAt: Date
}
```

## 🎯 For Tata Innovent 2026

This project demonstrates:
- **Innovation**: AI-powered voice processing for automotive service
- **Scalability**: MongoDB-based architecture for large-scale deployment
- **User Experience**: Intuitive interface for both customers and service providers
- **Data Analytics**: Comprehensive insights for business intelligence
- **Brand Integration**: Specifically designed for Tata Motors ecosystem

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables for Production
- Set `NEXTAUTH_URL` to your production domain
- Use production MongoDB connection string
- Configure proper API keys for voice processing

## 🔧 Customization

The platform can be extended with:
- Additional vehicle manufacturers
- Advanced AI features (GPT integration)
- Real-time chat support
- Mobile app development
- IoT device integration

## 📞 Support

For technical support or questions about the Tata Innovent 2026 submission:
- Review the code documentation
- Check API endpoint responses
- Verify environment configuration
- Ensure MongoDB connectivity

---

**Built with ❤️ for Tata Innovent 2026**

*Revolutionizing automotive service with AI-powered solutions*