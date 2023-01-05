"use strict";

const express = require("express");

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const router = express.Router();

/** Returns list of companies.
 * Like {companies: [{code, name}, ...]} */

router.get("/", async function (req, res, next) {
  const results = await db.query(
    `SELECT code, name
      FROM companies`
  );

  const companies = results.rows;

  return res.json({ companies: companies });
});

/** Return obj of company: {company: {code, name, description}}
 * If the company given cannot be found, this should return a 404 status response. */

router.get("/:code", async function (req, res, next) {
  const code = req.params.code;
  const company = await getCompany(code);

  return res.json({ company: company });
});

/** Adds a company.
 * Needs to be given JSON like: {code, name, description}
 * Returns obj of new company: {company: {code, name, description}}
 */

router.post("/", async function (req, res, next) {
  if (req.body === undefined) throw new BadRequestError();
  const { code, name, description } = req.body;
  const result = await db.query(
    `INSERT INTO companies (code, name, description)
      VALUES ($1, $2, $3)
      RETURNING code, name, description`,
    [code, name, description]
  );

  const company = result.rows[0];

  return res.json({ company: company });
});

/** Edit existing company.
 * Should return 404 if company cannot be found.
 * Needs to be given JSON like: {name, description.
 * Returns update company object: {company: {code, name, description}}
 */

router.put("/:code", async function (req, res, next) {
  if (req.body === undefined) throw new BadRequestError();
  const { name, description } = req.body;

  const code = req.params.code;
  // 404 guard clause - maybe change?
  await getCompany(code);

  const result = await db.query(
    `UPDATE companies
      SET name=$1,
          description=$2
      WHERE code = $3
      RETURNING code, name, description`,
    [name, description, code]
  );

  const company = result.rows[0];

  return res.json({ company: company });
});

/** Deletes company.
 * Should return 404 if company cannot be found.
 * Returns {status: "deleted"}
 */

router.delete("/:code", async function (req, res, next) {
  const code = req.params.code;
  // 404 guard clause - maybe change?
  await getCompany(code);

  await db.query("DELETE FROM companies WHERE code = $1", [code]);

  return res.json({ status: "deleted" });
});

// helper functions

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

  if (company) {
    return company;
  } else {
    throw new NotFoundError();
  }
}

module.exports = router;
