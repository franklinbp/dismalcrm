import { v4 as uuidv4 } from "uuid";

import database from "../database";
import Company from "../models/Company";
import Plan from "../models/Plan";
import Setting from "../models/Setting";
import User from "../models/User";
import { logger } from "../utils/logger";

const required = (name: string): string => {
  const value = (process.env[name] || "").trim();
  if (!value) {
    throw new Error(`${name} is required to initialize an empty DismalCRM database.`);
  }
  return value;
};

const bootstrapAdmin = async (): Promise<void> => {
  await database.authenticate();

  const existingUsers = await User.count();
  if (existingUsers > 0) {
    logger.info("DismalCRM bootstrap skipped because the database already has users");
    return;
  }

  const adminEmail = required("BOOTSTRAP_ADMIN_EMAIL").toLowerCase();
  const adminPassword = required("BOOTSTRAP_ADMIN_PASSWORD");
  if (adminPassword.length < 12) {
    throw new Error("BOOTSTRAP_ADMIN_PASSWORD must contain at least 12 characters.");
  }

  const companyName = (process.env.BOOTSTRAP_COMPANY_NAME || "Dismal").trim();
  const adminName = (process.env.BOOTSTRAP_ADMIN_NAME || "Administrador Dismal").trim();

  await database.transaction(async transaction => {
    const [plan] = await Plan.findOrCreate({
      where: { name: "DismalCRM Ecuador" },
      defaults: {
        name: "DismalCRM Ecuador",
        users: 10,
        connections: 2,
        queues: 10,
        value: 0
      } as any,
      transaction
    });

    const [company] = await Company.findOrCreate({
      where: { name: companyName },
      defaults: {
        name: companyName,
        email: adminEmail,
        status: true,
        planId: plan.id
      } as any,
      transaction
    });

    await User.create(
      {
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        profile: "admin",
        companyId: company.id
      } as any,
      { transaction }
    );

    await Setting.bulkCreate(
      [
        { key: "userApiToken", value: uuidv4(), companyId: company.id },
        { key: "userCreation", value: "disabled", companyId: company.id },
        { key: "chatBotType", value: "text", companyId: company.id },
        { key: "userRating", value: "disabled", companyId: company.id },
        { key: "scheduleType", value: "queue", companyId: company.id },
        { key: "CheckMsgIsGroup", value: "enabled", companyId: company.id },
        { key: "call", value: "disabled", companyId: company.id }
      ] as any,
      { transaction }
    );
  });

  logger.info({ adminEmail }, "DismalCRM administrator initialized");
};

bootstrapAdmin()
  .catch(error => {
    logger.error({ error }, "Could not initialize DismalCRM administrator");
    process.exitCode = 1;
  })
  .finally(async () => {
    await database.close();
  });
