// controllers/emailNotificationController.js
const sendMail = require("../utils/mail");
const gateRecipients = require("../config/gateRecipients");

/**
 * Sends a “fill the GRN” notification email.
 *
 * options = {
 *   gateEntryNumber:      string,
 *   vendorName_code:      string,
 *   vendorChallanNumber:  string,
 *   gate:                 string,
 *   items?:               Array<{ purchaseOrderNumber, itemName, quantity, remarks }>,
 *   createdBy:            string,
 * }
 */
exports.sendGrnNotification = async (options) => {
  try {
    // 1️⃣ Destructure with defaults
    const {
      gateEntryNumber,
      vendorName_code,
      vendorChallanNumber,
      gate,
      items = [], // default to empty array if undefined
      createdBy,
    } = options;

    // 2️⃣ Determine recipient email
    const to = gateRecipients[gate] || gateRecipients.OTHER;
    console.log(to);
    if (!to) {
      throw new Error(`No email recipient configured for gate "${gate}"`);
    }

    // 3️⃣ Build the “fill GRN” link
    const viewUrl = `${
      process.env.FRONTEND_URL
    }/createGRN?challan=${encodeURIComponent(vendorChallanNumber)}`;
    // const viewUrl = `${process.env.FRONTEND_URL}/createGRN`;
    // 4️⃣ Build table rows safely
    const rowsHtml = items
      .map(
        (i) => `
      <tr>
        <td>${i.purchaseOrderNumber}</td>
        <td>${i.itemName}</td>
        <td>${i.quantity}</td>
        <td>${i.remarks || ""}</td>
      </tr>
    `
      )
      .join("");

    // 5️⃣ Compose full HTML body
    const html = `
      <h2>Action Required: GRN Creation</h2>
      <p><strong>Gate Entry No:</strong> ${gateEntryNumber}</p>
      <p><strong>Gate:</strong> ${gate}</p>
      <p><strong>Vendor:</strong> ${vendorName_code}</p>
      <p><strong>Challan No:</strong> ${vendorChallanNumber}</p>
      <p><strong>Submitted By:</strong> ${createdBy}</p>

      <h3>Items:</h3>
      <table border="1" cellpadding="4" cellspacing="0" style="border-collapse:collapse;">
        <thead>
          <tr>
            <th>PO Number</th>
            <th>Item</th>
            <th>Quantity</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>

      <p style="margin-top:20px;">
        <a href="${viewUrl}"
           style="display:inline-block;padding:10px 16px;
                  background:#007bff;color:#fff;
                  border-radius:4px;text-decoration:none;">
          Click here to fill the GRN
        </a>
      </p>
    `;

    // 6️⃣ Send the email via your mail util
    await sendMail({
      to,
      subject: `GRN Pending: Challan ${vendorChallanNumber}`,
      html,
    });

    console.log(
      `✅ GRN notification email sent to ${to} for challan ${vendorChallanNumber}`
    );
  } catch (err) {
    console.error("❌ Error sending GRN email:", err);
  }
};
