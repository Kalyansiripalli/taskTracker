const { updateOrgSchema } = require("./organizations.validation");
const {
  listOrgs,
  getOrgById,
  updateOrg,
  deleteOrg,
} = require("./organizations.service");
const { z } = require("zod");

// Validate UUID parameter
const idParamSchema = z.string().uuid("Invalid organization ID format");

const getOrganizations = async (req, res, next) => {
  try {
    const orgs = await listOrgs();
    return res.status(200).json(orgs);
  } catch (err) {
    next(err);
  }
};

const getOrganization = async (req, res, next) => {
  try {
    const id = idParamSchema.parse(req.params.id);
    const org = await getOrgById(id);
    return res.status(200).json(org);
  } catch (err) {
    next(err);
  }
};

const updateOrganization = async (req, res, next) => {
  try {
    const id = idParamSchema.parse(req.params.id);
    const data = updateOrgSchema.parse(req.body);
    const org = await updateOrg(id, data);
    return res.status(200).json(org);
  } catch (err) {
    next(err);
  }
};

const deleteOrganization = async (req, res, next) => {
  try {
    const id = idParamSchema.parse(req.params.id);
    const result = await deleteOrg(id);
    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOrganizations,
  getOrganization,
  updateOrganization,
  deleteOrganization,
};
