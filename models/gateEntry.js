const { Model, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

class GateEntry extends Model {}

GateEntry.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    entryType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    procurementType: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    challanDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    mode_of_transports: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    transporter_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gateEntryNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    gateEntryTime: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
  },
  {
    sequelize,
    modelName: "GateEntry",
    tableName: "gateentries",
    timestamps: true,
    paranoid: false, // Adds soft deletion
  }
);

module.exports = GateEntry;
