import Prisma from "./../../db/prisma.js";

const processData3 = async (Model, id, fieldName, value) => {
  try {
  
    if (!value) return Promise.resolve();

    let exist;

    exist = await Model.findFirst({
      where: {
        organizationId: id,
        [fieldName]: value,
      },
    });
    return exist ? Promise.reject() : Promise.resolve();
  } catch (err) {
    return Promise.reject();
  }
};

export const checkMasterExists = async (value, { req }) => {
  await processData3(Prisma.worker, req.user.organization.id, "mobile" ,value );
};

export const checkNaginaMasterExists1 = async (value, { req }) => {
  await processData3(Prisma.nagina, req.user.organization.id, "naginaName" ,value );
};

export const checkNaginaMasterExists2 = async (value, { req }) => {
  await processData3(Prisma.nagina, req.user.organization.id, "naginaSize" ,value );
};
