# Movie Search Application - Take Home Challenge

## Overview

This is a full-stack movie search application that allows users to search for movies using the OMDb API and manage their favorite movies. The application consists of a NestJS backend and a Next.js frontend.

## Current Status

The application is **functional but has several issues** that need to be addressed. The codebase works for basic use cases but contains bugs, type safety issues, error handling problems, and code quality concerns that need attention.

Your task is to identify and fix bugs, refactor code, and improve the overall quality of the codebase. Some issues may only manifest under specific conditions or edge cases.

## Getting Started

### Prerequisites

- Node.js 18+ installed
- An OMDb API key (get one free at [omdbapi.com](http://www.omdbapi.com/apikey.aspx))

### Setup Instructions

1. **Backend Setup:**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory:
   ```
   OMDB_API_KEY=your_api_key_here
   PORT=3001
   CORS_ORIGINS=http://localhost:3000,https://your-domain.com
   ```
   Start the backend:
   ```bash
   npm run start:dev
   ```

2. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   ```
   Start the frontend:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Application Features

- Search for movies using the OMDb API
- Add movies to favorites
- Remove movies from favorites
- View paginated list of favorite movies
- Responsive UI design

## Your Task

Review the codebase systematically and address issues you find. You should:

1. **Identify Bugs**: Test the application thoroughly and identify bugs that affect functionality
2. **Fix Critical Issues**: Prioritize and fix bugs that cause crashes, incorrect behavior, or data inconsistencies
3. **Improve Error Handling**: Add proper error handling for API calls, user inputs, and edge cases
4. **Enhance Type Safety**: Fix TypeScript issues and ensure type consistency throughout the codebase
5. **Add Validation**: Implement input validation for user inputs and API parameters
6. **Refactor Code**: Improve code quality, remove duplication, and apply best practices
7. **Optimize Performance**: Address any performance issues you identify (unnecessary re-renders, inefficient queries, etc.)

**Note**: Some bugs may only appear under specific conditions. Test edge cases like empty states, invalid inputs, network failures, and rapid user interactions.

## Submission Guidelines

1. Fork or clone this repository
2. Make your changes
3. Document your changes in a `CHANGES.md` file explaining:
   - What issues you found
   - How you fixed them
   - Any refactoring you did
   - Any improvements you made
4. Submit your solution

## Time Limit

This challenge should be completable within **2 hours** for a senior developer.

## Notes

- **Testing is important**: Run the application and test various scenarios to identify issues
- **Focus on critical bugs first**: Prioritize bugs that affect core functionality
- **No new features needed**: Focus on fixing and improving existing code
- **End-to-end functionality**: Ensure all features work correctly after your changes
- **Production-ready code**: Apply best practices and ensure code quality

## Tips

- Start by running the application and testing all features
- Check browser console and server logs for errors
- Test edge cases (empty searches, invalid inputs, network issues)
- Review error handling in both frontend and backend
- Pay attention to type mismatches and TypeScript errors
- Consider race conditions and state synchronization issues

Good luck!

