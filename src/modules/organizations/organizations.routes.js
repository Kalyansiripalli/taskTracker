const express = require("express");
const {
  getOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
} = require("./organizations.controller");

const router = express.Router();

router.get("/", getOrganizations);
router.get("/:id", getOrganization);
router.put("/:id", updateOrganization);
router.delete("/:id", deleteOrganization);

module.exports = router;
