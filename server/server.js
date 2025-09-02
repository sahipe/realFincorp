import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import XLSX from "xlsx";

const app = express();
app.use(cors()); // adjust for your frontend URL
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(
    "mongodb+srv://formservices10:orCFD0tIt4zjfMD3@cluster0.8wlv5xx.mongodb.net/realFincorpDB"
  )
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// Schema
const customerSchema = new mongoose.Schema({
  name: String,
  arn: String,
  sip: String,
  health: String,
  motor: String,
  mf: String,
  life: String,
  visitingDateTime: Date,
  customerImage: String,
  latitude: Number,
  longitude: Number,
});

const Customer = mongoose.model("Customer", customerSchema);

// POST - Save customer
app.post("/api/customers", async (req, res) => {
  try {
    const data = req.body;
    if (data.visitingDateTime) {
      data.visitingDateTime = new Date(data.visitingDateTime);
    }
    const newCustomer = new Customer(data);
    await newCustomer.save();
    res.status(201).json({ message: "Customer saved successfully" });
  } catch (err) {
    console.error("❌ Save error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET - Download Excel with optional filters
app.get("/api/customers/excel", async (req, res) => {
  try {
    const { startDate, endDate, name } = req.query;
    const filter = {};

    if (startDate || endDate) {
      filter.visitingDateTime = {};
      if (startDate) filter.visitingDateTime.$gte = new Date(startDate);
      if (endDate) filter.visitingDateTime.$lte = new Date(endDate);
    }

    if (name) {
      filter.name = new RegExp(name, "i");
    }

    const customers = await Customer.find(filter).lean();
    if (!customers.length) {
      return res
        .status(404)
        .json({ message: "No data found for given filters" });
    }

    const formattedData = customers.map((c) => ({
      Name: c.name,
      ARN: c.arn,
      SIP: c.sip,
      Health: c.health,
      Motor: c.motor,
      "Mutual Fund": c.mf,
      Life: c.life,
      "Visiting Date & Time": c.visitingDateTime
        ? new Date(c.visitingDateTime).toLocaleString()
        : "",
      "Customer Image": c.customerImage,
      Latitude: c.latitude,
      Longitude: c.longitude,
    }));

    const worksheet = XLSX.utils.json_to_sheet(formattedData);

    // auto column width
    worksheet["!cols"] = Object.keys(formattedData[0]).map((key) => ({
      wch:
        Math.max(
          key.length,
          ...formattedData.map((row) =>
            row[key] ? row[key].toString().length : 0
          )
        ) + 2,
    }));

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Customers");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=customers_data.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(excelBuffer);
  } catch (err) {
    console.error("❌ Excel error:", err);
    res.status(500).json({ message: "Error generating Excel" });
  }
});

const PORT = 5000;
app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
