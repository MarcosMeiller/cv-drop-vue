# Mini Talento Tech Platform

A modern, responsive web application that connects talented developers with companies seeking top tech talent. Built with React and powered by Supabase for seamless authentication, data management, and file storage.

## 🚀 Features

### 🔐 Authentication & User Management
- **User Registration & Login** - Secure authentication with email/password
- **Role-based Access** - Separate flows for developers and companies
- **Profile Setup** - Guided onboarding for each user type

### 👨‍💻 Developer Features
- **Complete Profile Management** - Skills, experience, bio, location
- **CV Upload** - PDF document upload with download capability
- **Avatar Upload** - Profile picture management
- **Social Links** - GitHub and LinkedIn integration
- **Public Profile** - Showcased developer profiles for companies to discover

### 🏢 Company Features
- **Company Profile Management** - Company info, description, sector
- **Logo Upload** - Brand representation
- **Developer Browsing** - Search and filter talented developers
- **Contact Management** - Easy communication with developers

### 🎨 Design & User Experience
- **Responsive Design** - Optimized for desktop, tablet, and mobile
- **Dark Mode Toggle** - Light/dark theme switching
- **Minimalist UI** - Clean, modern interface
- **Smooth Animations** - Enhanced user interactions
- **Accessible Components** - WCAG compliant interface elements

### 🔍 Search & Discovery
- **Advanced Filtering** - Filter by skills, experience, location, sector
- **Real-time Search** - Instant results as you type
- **Public Directory** - Browse all developers and companies
- **Profile Views** - Detailed individual profile pages

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type safety and better developer experience
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful, accessible UI components
- **React Router** - Client-side routing
- **React Hook Form** - Form management with validation
- **Zod** - Schema validation

### Backend (Supabase)
- **Authentication** - User registration, login, and session management
- **PostgreSQL Database** - Relational data storage with real-time subscriptions
- **Storage** - File uploads for CVs, avatars, and company logos
- **Row Level Security (RLS)** - Data access control
- **Real-time** - Live data updates

### Development Tools
- **ESLint** - Code linting and style enforcement
- **PostCSS** - CSS processing
- **Lucide React** - Beautiful icon library

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout and navigation components  
│   └── ui/             # Base UI components (shadcn/ui)
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication logic
│   └── useTheme.ts     # Theme management
├── lib/                # Utility libraries
│   ├── supabase.ts     # Supabase client and types
│   └── utils.ts        # Common utilities
├── pages/              # Page components
│   ├── Dashboard.tsx   # User dashboard
│   ├── DeveloperProfile.tsx    # Developer profile management
│   ├── CompanyProfile.tsx      # Company profile management
│   ├── BrowseDevelopers.tsx    # Developer directory
│   ├── BrowseCompanies.tsx     # Company directory
│   ├── PublicDeveloperProfile.tsx  # Public developer view
│   └── PublicCompanyProfile.tsx    # Public company view
├── App.tsx             # Main application component
├── main.tsx           # Application entry point
└── index.css          # Global styles and design system
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account and project

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mini-talento-tech-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Update the Supabase configuration in `src/lib/supabase.ts`
   
4. **Set up the database**
   
   Create the following table in your Supabase SQL editor:
   
   ```sql
   -- Create user_profiles table
   CREATE TABLE user_profiles (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
     role TEXT NOT NULL CHECK (role IN ('developer', 'company')),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     
     -- Developer fields
     full_name TEXT,
     bio TEXT,
     skills TEXT[],
     github_url TEXT,
     linkedin_url TEXT,
     cv_url TEXT,
     avatar_url TEXT,
     years_experience INTEGER,
     location TEXT,
     email TEXT,
     
     -- Company fields  
     company_name TEXT,
     sector TEXT,
     description TEXT,
     contact_email TEXT,
     logo_url TEXT,
     website_url TEXT,
     company_size TEXT
   );
   
   -- Enable RLS
   ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
   
   -- Create policies
   CREATE POLICY "Users can view all profiles" ON user_profiles FOR SELECT USING (true);
   CREATE POLICY "Users can insert their own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
   CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = user_id);
   ```

5. **Set up Storage**
   
   Create the following storage buckets in Supabase:
   - `documents` (for CVs)
   - `avatars` (for profile pictures)
   - `logos` (for company logos)
   
   Set appropriate policies for each bucket to allow authenticated users to upload files.

6. **Start the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

7. **Open your browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
# or
yarn build
```

## 🎯 Usage

### For Developers
1. **Sign up** with your email and password
2. **Choose "Developer"** role during setup
3. **Complete your profile** - Add skills, experience, bio
4. **Upload your CV** and profile picture
5. **Browse companies** to find opportunities
6. **Share your profile** with potential employers

### For Companies  
1. **Sign up** with your company email
2. **Choose "Company"** role during setup
3. **Complete company profile** - Add description, sector, size
4. **Upload company logo**
5. **Browse developers** to find talent
6. **Contact developers** directly through their profiles

### Public Access
- Anyone can browse the **public developer directory**
- View detailed developer profiles without authentication
- Access company information and contact details

## 🔧 Configuration

### Environment Variables
The application uses Supabase's built-in configuration. Update the Supabase credentials in `src/lib/supabase.ts`:

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'
```

### Customization
- **Colors & Themes**: Modify `src/index.css` and `tailwind.config.ts`
- **Components**: Customize UI components in `src/components/ui/`
- **Authentication Flow**: Extend `src/hooks/useAuth.ts`

## 🤔 Why Supabase?

Supabase was chosen as the Backend-as-a-Service for several compelling reasons:

### 🚀 **Rapid Development**
- **Zero Backend Setup** - No need to build and maintain a custom backend
- **Built-in Authentication** - Complete user management out of the box
- **Real-time Database** - PostgreSQL with live subscriptions
- **File Storage** - Secure file uploads and management

### 🔒 **Security & Reliability**
- **Row Level Security (RLS)** - Fine-grained data access control
- **Enterprise-grade Infrastructure** - Built on AWS with high availability
- **Automatic Backups** - Data protection and disaster recovery
- **SSL/TLS Encryption** - Secure data transmission

### 🛠️ **Developer Experience**
- **PostgreSQL** - Full-featured SQL database with advanced queries
- **Real-time Features** - Live updates without additional complexity
- **Comprehensive Dashboard** - Easy database management and monitoring
- **Excellent Documentation** - Clear guides and API references

### 💰 **Cost Effective**
- **Free Tier** - Generous limits for development and small projects
- **Transparent Pricing** - Pay only for what you use
- **No Vendor Lock-in** - Standard PostgreSQL, easy migration

### 🔮 **Future-Proof**
- **Open Source** - Transparent development and community-driven
- **Active Development** - Regular updates and new features
- **Ecosystem Integration** - Works seamlessly with modern tools
- **Scalability** - Grows with your application needs

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Mini Talento Tech Platform** - Connecting talent with opportunity 🚀