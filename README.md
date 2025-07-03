# GIGAVIBE - AI-Powered Vocal Training App

GIGAVIBE is a comprehensive vocal training application that combines real-time audio analysis, AI coaching, and interactive practice exercises to help singers improve their vocal skills.

## Features

### 🎤 Real-Time Vocal Analysis

- **Pitch Detection**: Accurate frequency analysis with note identification and octave detection
- **Vocal Metrics**: Track pitch range, stability, vibrato detection, and volume control
- **Formant Analysis**: Vowel sound estimation and vocal tract analysis
- **Visual Feedback**: Circular pitch wheel, waveform visualizer, and horizontal pitch tracking

### 🎯 Interactive Practice Modes

- **Sing Mode**: Guided vocal exercises with target notes and real-time feedback
- **Analysis Mode**: Detailed vocal performance metrics and session statistics
- **Coach Mode**: AI-powered coaching with personalized feedback and recommendations

### 📊 Progress Tracking

- **Session History**: Track your vocal training sessions over time
- **Performance Analytics**: Detailed charts showing improvement trends
- **Achievement System**: Unlock achievements as you reach vocal milestones
- **Statistics Dashboard**: Comprehensive overview of your vocal development

### 🤖 AI-Powered Features

- **AI Coaching**: Get personalized feedback based on your vocal performance
- **Model Comparison**: Compare responses from different AI models (OpenAI, Anthropic, Google)
- **Usage Analytics**: Track your AI coaching interactions and usage patterns

### ⚙️ Customizable Settings

- **Sensitivity Control**: Adjust microphone sensitivity for optimal detection
- **Tuning Standard**: Customize reference pitch (default A440)
- **Theme Options**: Light, dark, or auto theme selection
- **Recording Options**: Auto-record functionality and export capabilities

## Project info

**URL**: https://lovable.dev/projects/84780d44-7fea-4b63-b612-fa9fce4ff83b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/84780d44-7fea-4b63-b612-fa9fce4ff83b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Getting Started

1. **Grant Microphone Permission**: Allow the app to access your microphone for vocal analysis
2. **Choose Your Mode**:
   - Start with **Sing Mode** for guided exercises
   - Use **Analysis Mode** to explore your vocal metrics
   - Try **Coach Mode** for AI-powered feedback
3. **Practice Regularly**: Use the Practice screen to work through structured vocal exercises
4. **Track Progress**: Monitor your improvement on the Progress screen
5. **Get AI Coaching**: Visit the AI Chat section for personalized vocal coaching

## What technologies are used for this project?

This project is built with:

- **Frontend**: React + TypeScript + Vite
- **UI Framework**: shadcn-ui + Tailwind CSS
- **Audio Processing**: Web Audio API for real-time vocal analysis
- **AI Integration**: Multiple AI models (OpenAI, Anthropic, Google) via Supabase Edge Functions
- **Database**: Supabase for progress tracking and user data
- **State Management**: React Query for server state management
- **Routing**: React Router for navigation

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/84780d44-7fea-4b63-b612-fa9fce4ff83b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
