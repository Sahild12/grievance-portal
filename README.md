# Citizen Grievance Portal

A modern and user-friendly web application designed to help citizens report civic issues, track complaint progress, and enable government or authorized officials to manage and resolve grievances efficiently.

This portal bridges the gap between the public and administration by offering a simple workflow for complaint submission, real-time status tracking, and department-based grievance handling.

**Live Demo:** [https://jansevaa.netlify.app/](https://jansevaa.netlify.app/)

## Project Overview

The Citizen Grievance Portal is built to simplify the way people raise concerns related to public services such as:

- Road and infrastructure problems
- Water and sanitation issues
- Streetlight and electricity complaints
- General civic service requests

Citizens can submit complaints with important details such as category, priority, description, location, and supporting files. Officials can then review, assign, and update the progress of each complaint through a dedicated dashboard.

## Key Features

- **Citizen Registration and Login**
  - Secure role-based access for citizens and officials.

- **Complaint Submission**
  - Users can file new grievances with a clear title, category, description, location, and priority level.

- **Complaint Tracking**
  - Submitted complaints can be monitored with statuses such as Pending, In Progress, and Resolved.

- **Official Dashboard**
  - Authorized officials can manage grievances, assign them to departments, and update their current status.

- **Department-Based Management**
  - Complaints can be grouped and handled by specific departments for better administration.

- **Responsive User Interface**
  - Clean, accessible design for desktop and mobile-friendly interaction.

- **Sample Data Support**
  - The application includes sample data to showcase complaint workflows and dashboards quickly.

## Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Additional Libraries:** CORS, Body Parser, Remix Icon

## Project Structure

```bash
gravience-portal/
├── public/
│   ├── css/
│   └── js/
├── src/
│   └── server.js
├── dashboard.html
├── index.html
├── official-dashboard.html
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

Make sure you have the following installed:

- Node.js
- npm
- MongoDB (local or cloud-based)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/your-username/grievance-portal.git
   ```

2. Navigate to the project directory
   ```bash
   cd grievance-portal
   ```

3. Install dependencies
   ```bash
   npm install
   ```

4. Start the application
   ```bash
   npm start
   ```

5. Open your browser and visit
   ```bash
   http://localhost:3000
   ```

### Environment Configuration

If you are using a custom MongoDB connection, set the environment variable:

```bash
MONGODB_URI=your_mongodb_connection_string
```

## Screenshots

This section is ready for your screenshots. Once you upload images, replace the placeholder blocks below with your final visuals.

### 1. Citizen Dashboard

![Citizen Dashboard Placeholder](./screenshots/citizen-dashboard.png)

> Add a screenshot of the citizen-facing dashboard here.

### 2. Complaint Submission Form

![Complaint Form Placeholder](./screenshots/complaint-form.png)

> Add a screenshot showing how citizens submit a grievance.

### 3. Official Dashboard

![Official Dashboard Placeholder](./screenshots/official-dashboard.png)

> Add a screenshot of the official management interface here.

### 4. Complaint Status Tracking

![Status Tracking Placeholder](./screenshots/status-tracking.png)

> Add a screenshot that highlights complaint progress and status updates.

## How It Works

1. A citizen logs in or registers an account.
2. The user submits a grievance with category, description, and location details.
3. The complaint is stored in the database and appears in the system.
4. Officials review and update the complaint status through the admin dashboard.
5. Citizens can track the progress until the issue is resolved.

## License

This project is licensed under the ISC License.

## Contribution

Contributions are welcome. If you would like to improve the portal, feel free to open an issue or submit a pull request.

