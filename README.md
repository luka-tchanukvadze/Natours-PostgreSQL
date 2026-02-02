# Natours - Tour Booking API (PostgreSQL Rebuild)

**Original MongoDB Version:** [[GitHub Repo]](https://github.com/luka-tchanukvadze/Natours) | **Live Demo (NoSQL):** [[Vercel Link]](https://natours-eight-psi.vercel.app/)

This is a complete architectural rebuild of the Natours API. I transitioned from a NoSQL setup to **Raw PostgreSQL** to master relational data modeling, manual query optimization, and strict data integrity without the use of an ORM.

## Key Technical Shift: Raw SQL
Unlike the original version using Mongoose, this project uses the `pg` driver to execute manual SQL queries. This allowed for:
* **Strict Schema Design:** Utilizing Primary/Foreign keys and Constraints.
* **Complex Joins:** Manual data aggregation across Tours, Users, and Reviews.
* **Deep Database Control:** Managing connections and transactions directly.



## Features

* **Secure Authentication & Authorization:** JWT-based protection with role-based access control.
* **Relational Booking Logic:** Optimized many-to-many relationships between users and tours.
* **Advanced Data Management:** Efficient user profile updates and tour lifecycle management.
* **SQL-Driven Reviews:** High-performance retrieval and display of user feedback.
* **Admin Controls:** Robust backend management interface.

## Technologies Used

* **Node.js:** Backend runtime environment.
* **Express.js:** Web application framework.
* **PostgreSQL:** Relational database.
* **Raw SQL:** Manual query building (No ORM).
* **JSON Web Tokens (JWT):** Authentication and authorization.

## Getting Started

1. **Clone the repository:**
   ```bash
   git clone [PostgreSQL-GitHub-Link]
