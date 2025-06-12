// //=================================================================================================//

const GateEntry = require("../models/gateEntry");
const ItemDetail = require("../models/itemDetail");
const User = require("../models/user");
const { sendGrnNotification } = require("./emailNotificationController");

// 1️⃣ Create a new GateEntry and associate previously saved ItemDetail rows based on userId and null gateEntryNumber
const createGateEntry = async (req, res) => {
  try {
    const {
      entryType,
      gate,
      procurementType,
      vendorName_code,
      vendorChallanNumber,
      challanDate,
      mode_of_transports,
      transporter_name,
      gateEntryTime,
      gateEntryNumber,
    } = req.body;

    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newGateEntry = await GateEntry.create({
      userId,
      entryType,
      gate,
      procurementType,
      vendorName_code,
      vendorChallanNumber,
      challanDate,
      mode_of_transports,
      transporter_name,
      gateEntryTime,
      gateEntryNumber,
    });

    // Update ItemDetail rows where userId matches and gateEntryNumber is null
    const [updatedCount] = await ItemDetail.update(
      {
        gateEntryNumber,
        vendorChallanNumber,
      },
      {
        where: {
          userId,
          gateEntryNumber: null,
        },
      }
    );

    console.log(
      `ItemDetail rows updated with gateEntryNumber ${gateEntryNumber}:`,
      updatedCount
    );

    const updatedItems = await ItemDetail.findAll({
      where: {
        gateEntryNumber,
      },
      attributes: ["purchaseOrderNumber", "itemName", "quantity", "remarks"],
    });

    await sendGrnNotification({
      gateEntryNumber,
      vendorName_code,
      vendorChallanNumber,
      gate,
      items: updatedItems,
      createdBy: user.username || user.email,
    });

    return res.status(201).json({
      message:
        "Gate entry created, item details associated, and notification email sent.",
      data: newGateEntry,
      updatedItemsCount: updatedCount,
    });
  } catch (err) {
    console.error("Error in createGateEntry:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 2️⃣ Fetch all GateEntry rows, including associated user info
const fetchGateEntries = async (req, res) => {
  try {
    const gateEntries = await GateEntry.findAll({
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email"],
        },
      ],
    });
    return res.status(200).json({ data: gateEntries });
  } catch (err) {
    console.error("Error fetching gate entries:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 3️⃣ Fetch a single GateEntry by its primary key, including user info
const getGateEntryById = async (req, res) => {
  try {
    const { id } = req.params;
    const gateEntry = await GateEntry.findByPk(id, {
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "username", "email"],
        },
      ],
    });
    if (!gateEntry) {
      return res.status(404).json({ error: "Gate entry not found" });
    }
    return res.status(200).json({ data: gateEntry });
  } catch (err) {
    console.error("Error fetching gate entry by ID:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 4️⃣ Update an existing GateEntry by ID and update ItemDetail rows based on vendorChallanNumber
const updateGateEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      entryType,
      gate,
      procurementType,
      vendorName_code,
      vendorChallanNumber,
      challanDate,
      mode_of_transports,
      transporter_name,
      gateEntryTime,
      gateEntryNumber,
    } = req.body;

    const gateEntry = await GateEntry.findByPk(id);
    if (!gateEntry) {
      return res.status(404).json({ error: "Gate entry not found" });
    }

    // Update only provided fields
    gateEntry.entryType = entryType || gateEntry.entryType;
    gateEntry.gate = gate || gateEntry.gate;
    gateEntry.procurementType = procurementType || gateEntry.procurementType;
    gateEntry.vendorName_code = vendorName_code || gateEntry.vendorName_code;
    gateEntry.vendorChallanNumber =
      vendorChallanNumber || gateEntry.vendorChallanNumber;
    gateEntry.challanDate = challanDate || gateEntry.challanDate;
    gateEntry.mode_of_transports =
      mode_of_transports || gateEntry.mode_of_transports;
    gateEntry.transporter_name = transporter_name || gateEntry.transporter_name;
    gateEntry.gateEntryTime = gateEntryTime || gateEntry.gateEntryTime;
    gateEntry.gateEntryNumber = gateEntryNumber || gateEntry.gateEntryNumber;

    await gateEntry.save();

    // Update ItemDetail rows where vendorChallanNumber matches and gateEntryNumber is null
    const [updatedCount] = await ItemDetail.update(
      {
        gateEntryNumber: gateEntry.gateEntryNumber,
        vendorChallanNumber: gateEntry.vendorChallanNumber,
      },
      {
        where: {
          vendorChallanNumber: gateEntry.vendorChallanNumber,
          // gateEntryNumber: null,
        },
      }
    );

    console.log(
      `ItemDetail rows updated on gate entry update: ${updatedCount}`
    );

    return res.status(200).json({
      message: "Gate entry updated successfully",
      data: gateEntry,
      updatedItemsCount: updatedCount,
    });
  } catch (err) {
    console.error("Error updating gate entry:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

// 5️⃣ Delete a GateEntry by ID
const deleteGateEntry = async (req, res) => {
  try {
    const { id } = req.params;
    const gateEntry = await GateEntry.findByPk(id);
    if (!gateEntry) {
      return res.status(404).json({ error: "Gate entry not found" });
    }
    await gateEntry.destroy();
    return res.status(200).json({ message: "Gate entry deleted successfully" });
  } catch (err) {
    console.error("Error deleting gate entry:", err);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createGateEntry,
  fetchGateEntries,
  getGateEntryById,
  updateGateEntry,
  deleteGateEntry,
};
