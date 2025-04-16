# CalAI - AI-Powered Food Recognition App
## By Piyush Sharma

A mobile application built that uses AI-powered food recognition to analyze meal photos, display nutritional data, and track dietary habits. The app leverages Google Cloud Vision API for food detection and USDA FoodData Central API for nutritional information, with Supabase as the backend service.

## 📱 Features

- **AI-Powered Food Recognition**: Capture food images and get instant nutritional analysis
- **Photo Capture**: Take photos using the device camera or select from gallery
- **Nutritional Information**: View detailed breakdown of calories, macros, and other nutrients
- **Meal History**: Track and review past meals with timestamps and nutritional data
- **User Authentication**: Secure login and account management via Supabase
- **Modern UI/UX**: Polished interface with animations and intuitive design
- **Offline Support**: Basic functionality when internet connection is unavailable

## 🛠️ Tech Stack

- **Framework**: Expo (React Native)
- **Language**: TypeScript
- **Navigation**: React Navigation v7
- **Backend/Auth**: Supabase
- **APIs**: 
  - Google Cloud Vision API (food recognition)
  - USDA FoodData Central API (nutritional data)
- **UI Components**: React Native Paper
- **Animation**: React Native Animated
- **Camera**: Expo Camera & Image Picker
- **Storage**: Supabase & AsyncStorage (offline support)
- **Styling**: React Native StyleSheet with Expo Linear Gradient

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v16 or newer)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go app on your mobile device for testing
- Supabase account
- Google Cloud Vision API key
- USDA FoodData Central API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd calAiclone
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create environment files:
   - Copy `.env.template` to `.env`
   - Add your API keys and Supabase credentials

```bash
# .env file example
SUPABASE_URL=your_supabase_url_here
SUPABASE_KEY=your_supabase_anon_key_here
GOOGLE_API_KEY=your_google_vision_api_key_here
USDA_API_KEY=your_usda_api_key_here
```

4. Create your app.json from the template:
   - Copy `app.template.json` to `app.json`
   - Update the configuration with your project details and API keys

5. Start the development server:
```bash
npx expo start
```

6. Scan the QR code with the Expo Go app on your mobile device to run the application

### API Setup

#### Google Cloud Vision API
1. Create a Google Cloud account and project
2. Enable the Cloud Vision API
3. Create an API key with appropriate restrictions
4. Add the API key to your `.env` file

#### USDA FoodData Central API
1. Register for an API key at https://fdc.nal.usda.gov/api-key-signup.html
2. Add the API key to your `.env` file

#### Supabase
1. Create a Supabase project
2. Set up the following tables:
   - `users`: For user profiles
   - `meals`: For storing meal history with nutritional data
3. Add your Supabase URL and anon key to the `.env` file

## 📂 Project Structure

```
calAiclone/
├── assets/              # Images, fonts, and other static assets
├── src/
│   ├── context/         # React context providers
│   ├── navigation/      # Navigation setup and configuration
│   ├── screens/         # Application screens
│   │   ├── AccountScreen.tsx    # User account management
│   │   ├── HistoryScreen.tsx    # Meal history and details
│   │   ├── HomeScreen.tsx       # Main screen with camera functionality
│   │   └── WelcomeScreen.tsx    # Onboarding and authentication
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions and API integrations
│       ├── foodRecognition.ts   # Google Vision and USDA API integration
│       └── supabase.ts          # Supabase client configuration
├── .env.template        # Template for environment variables
├── app.template.json    # Template for Expo configuration
├── package.json         # Project dependencies
└── tsconfig.json        # TypeScript configuration
```

## 🧠 Development Approach

### UI/UX Design Philosophy
The application follows a modern, minimalist design approach inspired by Apple's design principles. Key aspects include:

- **Intuitive Navigation**: Tab-based navigation for easy access to main features
- **Animations**: Subtle animations for transitions and feedback to enhance user experience
- **Accessibility**: Implemented proper contrast ratios and screen reader support
- **Error Handling**: User-friendly error messages and fallback options
- **Loading States**: Skeleton loaders and spinners for asynchronous operations

### API Integration Strategy
The app uses a two-step process for food recognition:

1. **Image Analysis**: Google Cloud Vision API analyzes the image to identify food items
2. **Nutritional Data**: USDA FoodData Central API provides detailed nutritional information
3. **Data Processing**: Results are processed and displayed in a user-friendly format

### State Management
- React's Context API for global state management
- Local component state for UI-specific state
- AsyncStorage for persistent storage of user preferences
- Supabase for remote data storage and synchronization

### Performance Optimization
- Image preprocessing to reduce API request size
- Memoization of expensive computations
- Lazy loading of components
- Efficient re-rendering strategies

## 🔄 Data Flow

1. User captures or selects a food image
2. Image is preprocessed and sent to Google Cloud Vision API
3. API identifies food items in the image
4. Food names are sent to USDA FoodData Central API
5. Nutritional data is retrieved and processed
6. Results are displayed to the user
7. User can save the meal to their history
8. Data is stored in Supabase for future reference

## 🧪 Testing

The application can be tested using:

```bash
# Run unit tests
npm test

# Check TypeScript types
npm run typecheck
```

## 📝 Notes

This project was developed as part of the task. Key points to consider:

- The application demonstrates integration of multiple APIs (Google Cloud Vision, USDA, Supabase)
- Modern UI/UX principles are implemented throughout the app
- Code is structured for maintainability and scalability
- TypeScript is used for type safety and better developer experience
- Documentation is comprehensive to facilitate understanding of the codebase

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

Built by Piyush Sharma for the HealEasy using Windsurf.
