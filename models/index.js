// models/index.js

const sequelize = require("../config/db");
const User = require("../models/user");
const GateEntry = require("../models/gateEntry");
const ItemDetail = require("../models/itemDetail");
const GRNItemList = require("../models/GRNItemList");

/**
 * Updated associations to use `gateEntryNumber` instead of `vendorChallanNumber`
 */

// 1️⃣ User <-> GateEntry
User.hasMany(GateEntry, { foreignKey: "userId", as: "gateEntries" });
GateEntry.belongsTo(User, { foreignKey: "userId", as: "user" });

// 2️⃣ GateEntry <-> ItemDetail by `gateEntryNumber`
GateEntry.hasMany(ItemDetail, {
  foreignKey: "gateEntryNumber", // ItemDetail.gateEntryNumber
  sourceKey: "gateEntryNumber", // GateEntry.gateEntryNumber
  as: "itemDetails",
});
ItemDetail.belongsTo(GateEntry, {
  foreignKey: "gateEntryNumber", // ItemDetail.gateEntryNumber
  targetKey: "gateEntryNumber", // GateEntry.gateEntryNumber
  as: "gateEntry",
});

// 3️⃣ GateEntry <-> GRNItemList by `gateEntryNumber`
GateEntry.hasMany(GRNItemList, {
  foreignKey: "gateEntryNumber", // this must exist in GRNItemList table
  sourceKey: "gateEntryNumber",
  as: "grnItems",
});
GRNItemList.belongsTo(GateEntry, {
  foreignKey: "gateEntryNumber",
  targetKey: "gateEntryNumber",
  as: "gateEntry",
});

const db = {
  sequelize,
  User,
  GateEntry,
  ItemDetail,
  GRNItemList,
};

// Sync database (force: false so it doesn’t drop existing tables)
const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false });
    console.log("✅ Database synced successfully");
  } catch (error) {
    console.error("❌ Error syncing database:", error);
  }
};

syncDatabase();

module.exports = db;

