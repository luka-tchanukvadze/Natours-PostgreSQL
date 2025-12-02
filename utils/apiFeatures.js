class APIFeatures {
  constructor(table, queryString) {
    this.table = table;
    this.queryString = queryString;
    this.sql = `SELECT * FROM ${this.table}`;
    this.values = [];
    this.index = 1;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excluded = ['page', 'sort', 'limit', 'fields'];
    excluded.forEach((f) => delete queryObj[f]);

    let conditions = [];

    for (const key in queryObj) {
      const value = queryObj[key];

      if (typeof value === 'object') {
        const operatorMap = { gte: '>=', gt: '>', lte: '<=', lt: '<' };
        for (const op in value) {
          const operator = operatorMap[op];
          if (!operator) continue;

          conditions.push(`${key} ${operator} $${this.index}`);
          this.values.push(value[op]);
          this.index++;
        }
      } else {
        conditions.push(`${key} = $${this.index}`);
        this.values.push(value);
        this.index++;
      }
    }

    if (conditions.length > 0) {
      this.sql += ' WHERE ' + conditions.join(' AND ');
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
