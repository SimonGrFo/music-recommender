# Music Recommender

A modern web application that helps you discover new music based on your favorite songs. Built with React and powered by the Last.fm API.
![image](https://github.com/user-attachments/assets/a4f9f460-e9c8-41e9-aeef-bdc34fb2b671)

## Features

- 🎵 Search for any song by title or "artist - song" format
- 🎯 Get personalized music recommendations using multiple sources:
  - Similar tracks from Last.fm (up to 100% match)
  - Tag-based recommendations (up to 80% match)
  - Artist's top tracks (up to 60% match)
- 📊 View detailed match percentages and sources
- 📈 Track statistics including play counts and listener numbers
- 📱 Responsive design that works on all devices

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a Last.fm API key at https://www.last.fm/api#getting-started
4. Rename `src/config/api.example.js` to `api.js` and add your API key
5. Start the development server:
   ```bash
   npm start
   ```

## Technologies

- React
- Last.fm API
- css
- Custom hooks for state management
