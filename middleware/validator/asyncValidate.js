const { where, Op } = require("sequelize");
const {
  Admin,
  Role,

  Sequelize,Employee,

  Organization,
} = require("./../../models/index");
const { email, mobile } = require("./rules");

const processData = async (Model, id = "null", value) => {
  try {
    if (!value) return Promise.resolve();

    let exist;

    if (id === "null") {
      exist = await Model.findOne({
        $or: [{ email: value }, { mobile: value }, { employee_id: value }],
      });
    } else {
      exist = await Model.findOne({
        $and: [
          { _id: { $ne: id } },
          {
            $or: [{ email: value }, { mobile: value }, { employee_id: value }],
          },
        ],
      });
    }

    return exist ? Promise.reject() : Promise.resolve();
  } catch (err) {
    return Promise.reject();
  }
};

const processData3 = async (Model, id, value) => {
  try {
    if (!value) return Promise.resolve();

    let exist;

    exist = await Model.findOne({
      _id: { $ne: id },
      $or: [{ email: value }, { mobile: value }],
    });

    return exist ? Promise.reject() : Promise.resolve();
  } catch (err) {
    return Promise.reject();
  }
};

const processData2 = async (Model, id = "null", value) => {
  try {
    if (!value) return Promise.resolve();

    let exist = await Model.findOne({
      attributes: ["id"],
      where: Sequelize.and(
        { id: { [Sequelize.Op.not]: id } },
        Sequelize.or({ name: value })
      ),
    });
    return exist ? Promise.reject() : Promise.resolve();
  } catch (err) {
    return Promise.reject();
  }
};

exports.checkValidRoleId = async (value, { req }) => {
  try {
    if (!value) return Promise.resolve();

    let role = await Role.findByPk(value);
    if (role?.status == 0) return Promise.reject();
    return role ? Promise.resolve() : Promise.reject();
  } catch (err) {
    return Promise.reject();
  }
};

exports.checkRoleNameExist = async (name, { req }) => {
  try {
    if (!name) return Promise.resolve();

    let role = await Role.findOne({ name: name });
    return role ? Promise.reject() : Promise.resolve();
  } catch (error) {
    return Promise.reject();
  }
};

//-----------------------------   --------------//

exports.checkAdminExists = async (value, { req }) => {
  await processData(Admin, req.query.id, value);
};

//---------------------------------------------------------------------------------//

exports.checkOrgemail = async (value, { req }) => {
  try {
    let id = req.params.id;
    if (!value) return Promise.resolve();

    let exist;

    if (!id) {
      exist = await Organization.findOne({ where: { email: value } });
    } else {
      exist = await Organization.findOne({
        where: {
          id: {
            [Op.ne]: +id,
          },

          email: value,
        },
      });
    }
   
    return exist ? Promise.reject() : Promise.resolve();
  } catch (err) {
    return Promise.reject();
  }
};






exports.checkOrmobile = async (value, { req }) => {
  try {
    let id = req.params.id;
    if (!value) return Promise.resolve();

    let exist;

    
    if (!id) {
      exist = await Organization.findOne({ where: { mobile_no: value } });
    } else {
      exist = await Organization.findOne({
        where: {
          id: {
            [Op.ne]: +id,
          },

          mobile_no: value,
        },
      });
    }

    
    return exist ? Promise.reject() : Promise.resolve();
  } catch (err) {
    console.log(err)
    return Promise.reject();
  }
};







exports.checkemployeemobile = async (value, { req }) => {
  try {
    let id = req.params.id;
    if (!value) return Promise.resolve();

    let exist;

    
    if (!id) {
      exist = await Employee.findOne({ where: { mobile_no: value } });
    } else {
      exist = await Employee.findOne({
        where: {
          id: {
            [Op.ne]: +id,
          },

          mobile_no: value,
        },
      });
    }

    
    return exist ? Promise.reject() : Promise.resolve();
  } catch (err) {
    console.log(err)
    return Promise.reject();
  }
};










exports.checkprofileExists = async (value, { req }) => {
  await processData3(Admin, req.user_id, value);
};
