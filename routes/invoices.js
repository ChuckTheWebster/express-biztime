"use strict";

const express = require("express");

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const router = express.Router();

/** Returns list of invoices.
 * Like {invoices: [{id, comp_code}, ...]} */

router.get("/", async function (req, res, next) {
  const results = await db.query(
    `SELECT id, comp_code
      FROM invoices`
  );

  const invoices = results.rows;

  return res.json({ invoices });
});


/** Returns obj on given invoice.

If invoice cannot be found, returns 404.

Returns {invoice: {id, amt, paid, add_date, paid_date, company: {code, name, description}}
*/
 router.get("/:code", async function (req, res, next) {
  const code = req.params.code;
  const company = await getCompany(code);

  return res.json({ company });
});


// helper functions

/** Returns a company object after querying the database for a company with input code.
 * Throws a 404 not found error if no associated company in database with input code.
 */
 async function getInvoice(id) {
  const result = await db.query(
    `SELECT id, name, description
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
