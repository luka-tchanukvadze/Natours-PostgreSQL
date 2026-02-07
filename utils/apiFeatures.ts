import AppError from './appError.js';

interface QueryString {
  page?: string;
  sort?: string;
  limit?: string;
  fields?: string;
  [key: string]: any; // Allow for other properties
}

interface ColumnWhitelist {
  tours: string[];
  users: string[];
  reviews: string[];
  [key: string]: string[]; // Allow for other tables
}

class APIFeatures {
  table: string;
  queryString: QueryString;
  sql: string;
  values: (string | number)[];
  columnWhitelist: ColumnWhitelist;

  constructor(table: string, queryString: QueryString, select: string = '*') {
    this.table = table;
    this.queryString = queryString;
    this.sql = `SELECT ${select} FROM ${this.table}`;
    this.values = [];

    // Define a whitelist of columns that can be used in sort and fields
    this.columnWhitelist = {
      tours: [
        'id',
        'name',
        'duration',
        'max_group_size',
        'difficulty',
        'rating',
        'ratings_quantity',
        'price',
      ],
      users: ['id', 'name', 'email', 'role'],
      reviews: ['id', 'rating', 'created_at', 'tour_id', 'user_id'],
    };
  }

  filter(): APIFeatures {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    const conditions: string[] = [];
    const allowedFields: string[] = this.columnWhitelist[this.table] || [];

    for (const field in queryObj) {
      if (!allowedFields.includes(field)) continue; // Skip non-whitelisted fields

      if (typeof queryObj[field] === 'object' && queryObj[field] !== null) {
        for (const operator in queryObj[field]) {
          const sqlOperatorMap: { [key: string]: string } = {
            gte: '>=',
            gt: '>',
            lte: '<=',
            lt: '<',
          };

          const sqlOperator = sqlOperatorMap[operator];
          if (!sqlOperator) continue; // Skip unsupported operators

          const value = queryObj[field][operator];
          this.values.push(value);
          conditions.push(`"${field}" ${sqlOperator} $${this.values.length}`);
        }
      } else {
        // Handle direct equality
        const value = queryObj[field];
        this.values.push(value);
        conditions.push(`"${field}" = $${this.values.length}`);
      }
    }

    if (conditions.length) {
      this.sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    return this;
  }

  sort(): APIFeatures {
    const allowed: string[] = this.columnWhitelist[this.table] || [];
    if (this.queryString.sort) {
      const sortByFields: string[] = this.queryString.sort.split(',');
      const sortClauses: string[] = sortByFields.map((field) => {
        const direction = field.startsWith('-') ? 'DESC' : 'ASC';
        const cleanField = field.replace(/^-/, '');

        if (!allowed.includes(cleanField)) {
          throw new AppError(`Invalid sort field: ${cleanField}`, 400);
        }
        // Quote column name to handle reserved keywords and special characters
        return `"${cleanField}" ${direction}`;
      });

      if (sortClauses.length > 0) {
        this.sql += ` ORDER BY ${sortClauses.join(', ')}`;
      }
    }
    return this;
  }

  fields(): APIFeatures {
    const allowed: string[] = this.columnWhitelist[this.table] || [];
    if (this.queryString.fields) {
      const fieldsToSelect: string[] = this.queryString.fields.split(',');
      const selectedFields: string[] = fieldsToSelect.filter((field) =>
        allowed.includes(field),
      );

      if (selectedFields.length > 0) {
        // Quote column names
        const cols = selectedFields.map((f) => `"${f}"`).join(', ');
        this.sql = this.sql.replace(
          'SELECT *',
          `SELECT ${cols}, "id"`, // Ensure ID is always included
        );
      }
    }
    return this;
  }

  paginate(): APIFeatures {
    const page = Math.max(1, Number(this.queryString.page) || 1);
    const limit = Math.max(1, Number(this.queryString.limit) || 100);
    const offset = (page - 1) * limit;

    this.values.push(limit);
    this.sql += ` LIMIT $${this.values.length}`;

    this.values.push(offset);
    this.sql += ` OFFSET $${this.values.length}`;

    return this;
  }
}

export default APIFeatures;