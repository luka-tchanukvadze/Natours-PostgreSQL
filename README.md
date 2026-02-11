# Natours - Tour Booking API (PostgreSQL Rebuild)

**Note:** For full project context, features, and business logic details, see the [Original MongoDB Version](https://github.com/luka-tchanukvadze/Natours).  
**Links:** [Original Repo](https://github.com/luka-tchanukvadze/Natours) | [Live Demo (NoSQL)](https://natours-eight-psi.vercel.app/)

This is a complete architectural rebuild of the Natours API. I transitioned from a NoSQL setup to **Raw PostgreSQL** to master relational data modeling, manual query optimization, and professional testing workflows without the abstraction of an ORM.

## Key Technical Shift: Raw SQL and Relational Mastery
Unlike the original version using Mongoose, this project utilizes the `pg` driver to execute manual SQL queries. This approach demonstrates:
*   **Manual Schema Design:** Implementing Primary/Foreign keys and SQL Constraints directly.
*   **Complex Joins:** Engineered data aggregation across Tours, Users, and Reviews using raw SQL.
*   **No-ORM Performance:** Deep control over database connections, transactions, and query execution plans.
*   **Database Isolation & Automated Cleanup:** Developed a custom testing environment using raw SQL scripts (TRUNCATE/RESTART IDENTITY) to reset the PostgreSQL state between test suites, ensuring isolated and repeatable results.

## Testing and Quality Assurance
The backend was developed with a focus on reliability and verified stability:
*   **Integration Testing:** Extensive API coverage using **Jest** and **Supertest**.
*   **Type Safety:** Built with **TypeScript** to ensure robust data structures and prevent common runtime errors.

## Features
*   **Secure Auth:** JWT-based protection with role-based access control (RBAC).
*   **Relational Logic:** Optimized many-to-many relationships for bookings handled via raw SQL.
*   **High-Performance Reviews:** Efficient retrieval of user feedback through optimized relational joins.
*   **Admin Controls:** Robust backend management for tours and users.

## Technologies Used
*   **Node.js and Express.js:** Backend runtime and framework.
*   **PostgreSQL (No ORM):** Primary relational database using raw SQL queries.
*   **TypeScript:** Language for type-safety and improved developer experience.
*   **Jest and Supertest:** Automated testing framework and HTTP assertions.

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/luka-tchanukvadze/Natours-PostgreSQL
    ```
