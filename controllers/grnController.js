const { GateEntry, ItemDetail, GRNItemList, User } = require("../models");
const asyncHandler = require("express-async-handler");

// GET all GRN data filtered by user's gate (or all if admin)
exports.getGRNData = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isAdmin = user.role === "admin";

    const entries = await GateEntry.findAll({
      attributes: [
        "vendorName_code",
        "vendorChallanNumber",
        "gateEntryNumber",
        "gate",
      ],
      include: [
        {
          model: ItemDetail,
          as: "itemDetails",
          required: true,
          attributes: [
            "purchaseOrderNumber",
            "itemName",
            "quantity",
            "remarks",
          ],
        },
        {
          model: GRNItemList,
          as: "grnItems",
          required: false,
          attributes: ["grnNumber", "grnStatus", "createdAt"],
        },
      ],
      order: [
        ["vendorChallanNumber", "ASC"],
        [{ model: ItemDetail, as: "itemDetails" }, "itemName", "ASC"],
      ],
    });

    const filtered = await Promise.all(
      entries.map(async (e) => {
        if (isAdmin) return true;
        const hasAccess = await GateEntry.findOne({
          where: { userId, gate: e.gate },
        });
        return !!hasAccess;
      })
    );

    const visibleEntries = entries.filter((_, i) => filtered[i]);

    const formatted = visibleEntries.map((e) => {
      const grnRecord = e.grnItems[0];
      return {
        vendorName_code: e.vendorName_code,
        vendorChallanNumber: e.vendorChallanNumber,
        gateEntryNumber: e.gateEntryNumber,
        gate: e.gate,
        grnNumber: grnRecord?.grnNumber || null,
        grnDate: grnRecord?.createdAt || null,
        grnStatus: grnRecord?.grnStatus || "pending",
        items: e.itemDetails.map((i) => ({
          purchaseOrderNumber: i.purchaseOrderNumber,
          itemName: i.itemName,
          quantity: i.quantity,
          remarks: i.remarks,
        })),
      };
    });

    return res.json(formatted);
  } catch (err) {
    console.error("❌ Failed to fetch GRN data:", err);
    return res.status(500).json({ error: "Failed to fetch GRN data" });
  }
};

// SAVE GRN — with proper access control
exports.saveGRN = async (req, res) => {
  try {
    const userId = req.user.id;
    const { vendorChallanNumber, grnNumber } = req.body;

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const isAdmin = user.role === "admin";

    const gateEntry = await GateEntry.findOne({
      where: { vendorChallanNumber },
    });
    if (!gateEntry)
      return res.status(404).json({ error: "Gate entry not found" });

    if (!isAdmin) {
      const hasAccess = await GateEntry.findOne({
        where: { userId, gate: gateEntry.gate },
      });
      if (!hasAccess) {
        return res
          .status(403)
          .json({ error: `Access denied for gate ${gateEntry.gate}` });
      }
    }

    const itemDetails = await ItemDetail.findAll({
      where: { gateEntryNumber: gateEntry.gateEntryNumber },
    });

    if (itemDetails.length === 0) {
      return res
        .status(400)
        .json({ error: "No items found for this gate entry" });
    }

    await GRNItemList.destroy({ where: { vendorChallanNumber } });

    const grnRecords = itemDetails.map((item) => ({
      vendorChallanNumber,
      gateEntryNumber: gateEntry.gateEntryNumber,
      grnNumber,
      grnStatus: "closed",
      grnDate: new Date(),
      purchaseOrderNumber: item.purchaseOrderNumber,
      itemName: item.itemName,
      quantity: item.quantity,
      remarks: item.remarks,
    }));

    await GRNItemList.bulkCreate(grnRecords);

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Error saving GRN:", err);
    res.status(500).json({ error: "Failed to save GRN" });
  }
};

// VIEW GRN by gateEntryNumber with proper access check
exports.viewGRN = asyncHandler(async (req, res) => {
  try {
    const user = req.user;
    const gateEntryNumber = req.params.gateEntryNumber;

    if (!gateEntryNumber) {
      return res.status(400).json({ message: "gateEntryNumber is required" });
    }

    const gateEntry = await GateEntry.findOne({
      where: { gateEntryNumber },
      include: [
        {
          model: GRNItemList,
          as: "grnItems",
          required: true,
          attributes: [
            "grnNumber",
            "grnStatus",
            "grnDate",
            "purchaseOrderNumber",
            "itemName",
            "quantity",
            "remarks",
            "createdAt",
          ],
        },
      ],
    });

    if (!gateEntry) {
      return res
        .status(404)
        .json({ message: "GRN not found for this gateEntryNumber" });
    }

    const entryGate = gateEntry.gate;

    if (user.role === "admin") {
      return res.json(gateEntry);
    }

    const allowed = await GateEntry.findOne({
      where: { userId: user.id, gate: entryGate },
    });

    if (!allowed) {
      return res
        .status(403)
        .json({ message: `Access denied for gate ${entryGate}` });
    }

    return res.json(gateEntry);
  } catch (err) {
    console.error("Error in viewGRN:", err);
    return res.status(500).json({ message: "Server error" });
  }
});
