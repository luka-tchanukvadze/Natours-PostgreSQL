class APIFeatures {
  constructor(table, queryString, select = '*') {
    this.table = table;
    this.queryString = queryString;
    this.select = select;
    this.sql = `SELECT ${this.select} FROM ${this.table}`;
    this.values = [];
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    const conditions = [];

    for (const field in queryObj) {
      if (typeof queryObj[field] === 'object') {
        for (const operator in queryObj[field]) {
          const sqlOperatorMap = {
            gte: '>=',
            gt: '>',
            lte: '<=',
            lt: '<',
          };

          const sqlOperator = sqlOperatorMap[operator];
          const value = queryObj[field][operator];

          this.values.push(value);
          conditions.push(`${field} ${sqlOperator} $${this.values.length}`);
        }
      }
    }

    if (conditions.length) {
      this.sql += ` WHERE ${conditions.join(' AND ')}`;
    }

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort
        .split(',')
        .map((f) => (f.startsWith('-') ? `${f.slice(1)} DESC` : `${f} ASC`))
        .join(', ');

      this.sql += ` ORDER BY ${sortBy}`;
    }
    return this;
  }

  fields() {
    if (this.queryString.fields) {
      const cols = this.queryString.fields.split(',').join(', ');
      this.sql = this.sql.replace('SELECT *', `SELECT ${cols}`);
    }
    return this;
  }

  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = +this.queryString.limit || 100;
    const offset = (page - 1) * limit;

    this.sql += ` LIMIT ${limit} OFFSET ${offset}`;
    return this;
  }
}

module.exports = APIFeatures;
