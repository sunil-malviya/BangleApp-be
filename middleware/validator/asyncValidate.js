
import Prisma from "./../../db/prisma.js"




//   try {
//     if (!value) return Promise.resolve();

//     let exist;

//     if (id === "null") {
//       exist = await Model.findOne({
//         $or: [{ email: value }, { mobile: value }, { employee_id: value }],
//       });
//     } else {
//       exist = await Model.findOne({
//         $and: [
//           { _id: { $ne: id } },
//           {
//             $or: [{ email: value }, { mobile: value }, { employee_id: value }],
//           },
//         ],
//       });
//     }

//     return exist ? Promise.reject() : Promise.resolve();
//   } catch (err) {
//     return Promise.reject();
//   }
// };

const processData3 = async (Model, id, value) => {
  try {

    console.log(value,'value')

    console.log(id,'id')
    if (!value) return Promise.resolve();

    let exist;

    exist = await  Model.findUnique({
      where: {
        organizationId: id,
        mobile: value
      }
    });

    return exist ? Promise.reject() : Promise.resolve();
  } catch (err) {
    return Promise.reject();
  }
};







export const checkMasterExists = async (value, { req }) => {
  await processData3(Prisma.worker, req.user.organization.id, value);
};

export const checkNaginaMasterExists = async (value, { req }) => {
  await processData3(Prisma.nagina, req.user.organization.id, value);
};