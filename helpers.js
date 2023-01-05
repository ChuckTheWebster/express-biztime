const db = require("./db");

/** Returns a company object after querying the database for a company with input code.
 * Throws a 404 not found error if no associated company in database with input code.
 */
async function getCompany(code) {
  const result = await db.query(
    `SELECT code, name, description
      FROM companies
      WHERE code = $1`,
    [code]
  );

  const company = result.rows[0];

  return company;
}

/** Returns a company object after querying the database for a company with input name.
 * Throws a 404 not found error if no associated company in database with input name.
 */
async function getCompanyByName(name) {
  const result = await db.query(
    `SELECT code, name, description
      FROM companies
      WHERE name = $1`,
    [name]
  );

  const company = result.rows[0];

  return company;
}

module.exports = { getCompany, getCompanyByName };