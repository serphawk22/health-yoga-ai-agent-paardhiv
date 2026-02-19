PROJECT OVERVIEW

HealthAgent is a comprehensive healthcare management ecosystem designed to facilitate seamless interaction between medical professionals and patients. The platform integrates traditional medical practice requirements with modern technological advancements, providing a secure and interactive environment for virtual care. It encompasses specialized modules for appointment scheduling, real-time video consultations, health product commerce, and personalized fitness tracking.

CORE CAPABILITIES

Professional Suite
Practitioners are provided with a high-fidelity operational hub to manage their clinical roster. Features include real-time scheduling, patient history management through secure chat channels, and an interactive availability manager. The dashboard provides analytical insights into daily consults and practice growth metrics.

Patient Suite
Patients can access specialized healthcare services through a streamlined interface. The system utilizes natural language processing to extract appointment details from text, provides an automated exercise and yoga generation engine, and hosts a marketplace for purchasing health-related inventory.

Video Consultation Suite
A integrated WebRTC-based communication system allows for zero-latency video sessions. These sessions are securely routed through unique meeting identifiers and include automated workflow transitions that update appointment statuses upon the conclusion of a call.

TECHNICAL SETUP

To initialize the project in a local environment, follow the procedures outlined below.

1. System Requirements
Ensure that Node.js v18.0.0 or higher is installed and that a PostgreSQL database instance is accessible.

2. Dependency Installation
Execute the following command to install the required node packages.
npm install --legacy-peer-deps

3. Environment Configuration
Establish a configuration file in the root directory and define the following variables.
DATABASE_URL="your_database_connection_string"
NEXTAUTH_SECRET="your_authentication_secret"
NEXTAUTH_URL="http://localhost:3000"

4. Database Integration
Propagate the relational schema and generate the client library.
npx prisma generate
npx prisma db push

5. Development Execution
Launch the application server in development mode.
npm run dev

made by paardhu
