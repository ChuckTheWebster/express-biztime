"use strict";

const express = require("express");

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { getCompany, getCompanyByName } = require("../helpers");
const router = express.Router();

const MISSING_INFO_ERROR_MSG = "Invalid or missing information.";

/** Returns list of companies.
 * Like {companies: [{code, name}, ...]} */

router.get("/", async function (req, res, next) {
  const results = await db.query(
    `SELECT code, name
      FROM companies`
  );

  const companies = results.rows;

  return res.json({ companies });
});

/** Return obj of company: {company: {code, name, description}}
 * If the company given cannot be found, this should return a 404 status response. */

router.get("/:code", async function (req, res, next) {
  const code = req.params.code;
  const company = await getCompany(code);

  if (!company) {
    throw new NotFoundError(`No company associated with code: ${code}`);
  }

  return res.json({ company });
});

/** Adds a company.
 * Needs to be given JSON like: {code, name, description}
 * Returns obj of new company: {company: {code, name, description}}
 */

router.post("/", async function (req, res, next) {
  if (req.body === undefined) throw new BadRequestError();
  const { code, name, description } = req.body;

  if (await getCompany(code)) {
    throw new BadRequestError(`A company with code: ${code} already exists.`);
  }

  if (await getCompanyByName(name)) {
    throw new BadRequestError(`A company with name: ${name} already exists.`);
  }

  let company;
  if (code && name && description) {
    const result = await db.query(
      `INSERT INTO companies (code, name, description)
        VALUES ($1, $2, $3)
        RETURNING code, name, description`,
      [code, name, description]
    );
    company = result.rows[0];
  } else {
    throw new BadRequestError(MISSING_INFO_ERROR_MSG);
  }

  if (!company) {
    throw new NotFoundError(`No company associated with code: ${code}`);
  }

  return res.status(201).json({ company });
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

  const result = await db.query(
    `UPDATE companies
      SET name=$1,
          description=$2
      WHERE code = $3
      RETURNING code, name, description`,
    [name, description, code]
  );

  const company = result.rows[0];
  if (!company) {
    throw new NotFoundError(`No company associated with code: ${code}`);
  }

  return res.json({ company });
});

/** Deletes company.
 * Should return 404 if company cannot be found.
 * Returns {status: "deleted"}
 */

router.delete("/:code", async function (req, res, next) {
  const code = req.params.code;

  const result = await db.query(
    "DELETE FROM companies WHERE code = $1 RETURNING code",
    [code]
  );
  const company = result.rows[0];
  if (!company) {
    throw new NotFoundError(`No company associated with code: ${code}`);
  }

  return res.json({ status: "deleted" });
});

module.exports = router;