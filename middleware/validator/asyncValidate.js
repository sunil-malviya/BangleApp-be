
import Prisma from "./../../db/prisma.js"

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
