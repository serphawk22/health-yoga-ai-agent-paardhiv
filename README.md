# Health Agent 

A personalized health management platform built with Next.js 14. This application serves as a bridge between patients and health professionals, featuring AI-driven insights, marketplace integration, and comprehensive health tracking.

## Core Features

###  For Patients
- **AI Health Advisor**: Context-aware chat powered by OpenAI to get immediate health-related guidance.
- **Marketplace**: Browse and purchase health supplements, equipment, and courses curated by professionals.
- **Health Tracking**: Manage diet plans, exercise routines, and specialized yoga sessions.
- **Goal Setting**: Set and monitor long-term health objectives with visual progress metrics.
- **Assessments**: Data-driven health scoring to track overall well-being over time.

###  For Professionals (Doctors & Instructors)
- **Product Management**: A dedicated seller dashboard to list and manage products in the marketplace.
- **Patient Management**: Handle appointments and track patient progress (if assigned).
- **Availability**: Manage schedule and consultation slots directly through the portal.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Framer Motion for animations.
- **Backend/Database**: Prisma ORM with PostgreSQL.
- **AI Integration**: OpenAI API for the "Advisor" chat functionality.
- **UI Components**: Custom components built with Lucide icons and Radix UI primitives.
- **3D Visuals**: Spline integration for interactive 3D backgrounds and elements.

## Getting Started

### Prerequisites
- Node.js (v18+)
- A PostgreSQL database instance
- OpenAI API Key

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Set up your environment variables (copy `.env.example` to `.env`):
   ```env
   DATABASE_URL="postgresql://..."
   JWT_SECRET="your-secret"
   OPENAI_API_KEY="your-api-key"
   ```

3. Sync the database:
   ```bash
   npm run db:push
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure

- `/app`: Next.js App Router pages and layouts.
- `/components`: Reusable UI components (Layout, Features, Marketplace).
- `/lib`: Server actions, prisma client, and utility functions.
- `/prisma`: Database schema and seed scripts.
