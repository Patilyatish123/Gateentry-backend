const sequelize = require("../config/db");
const { DataTypes, Model } = require("sequelize");

class GRNItemList extends Model {}

GRNItemList.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    vendorChallanNumber: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    grnNumber: {
      type: DataTypes.STRING(100),
      allowNull: true, // ✅ Allow initially null
    },
    grnDate: {
      type: DataTypes.DATE,
      allowNull: true, // ✅ Allow null before GRN is created
      defaultValue: null,
    },
    gateEntryNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    purchaseOrderNumber: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    itemName: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    grnStatus: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "pending",
    },
  },
  {
    sequelize,
    modelName: "GRNItemList",
    tableName: "grnItemList",
    timestamps: true, // ✅ Adds createdAt and updatedAt automatically
  }
);

module.exports = GRNItemList;
