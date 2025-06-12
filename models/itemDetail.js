const sequelize = require("../config/db");
const { DataTypes, Model } = require("sequelize");

class ItemDetail extends Model {}

ItemDetail.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    gateEntryNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    vendorChallanNumber: {
      // <---- Add this
      type: DataTypes.STRING,
      allowNull: true,
    },
    purchaseOrderNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    itemName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    remarks: {
      type: DataTypes.STRING,
    },
    customFields: {
      type: DataTypes.JSON,
      defaultValue: {},
    },
  },
  {
    sequelize,
    modelName: "ItemDetail",
    tableName: "itemdetails",
    timestamps: true,
  }
);

module.exports = ItemDetail;
