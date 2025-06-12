//=============================================================================================================//

// controllers/itemDetailController.js

const ItemDetail = require("../models/itemDetail");

const createItemDetails = async (req, res) => {
  try {
    const { items } = req.body;
    // `protect` middleware ensures req.user exists
    const userId = req.user.id;

    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No items provided" });
    }

    const created = [];

    for (const row of items) {
      const { purchaseOrderNumber, itemName, quantity, remarks, ...rest } = row;
      const detail = await ItemDetail.create({
        userId, // ✅ set the logged-in user's ID
        purchaseOrderNumber,
        itemName,
        quantity,
        remarks,
        gateEntryNumber: null, // ✅ will be updated later
        customFields: rest,
      });
      created.push(detail);
    }

    return res.status(201).json({ success: true, data: created });
  } catch (err) {
    console.error("Error in createItemDetails:", err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};

module.exports = {
  createItemDetails,
};
