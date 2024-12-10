require("dotenv").config();

const supabase = require("@supabase/supabase-js");
const cors = require("cors");
const midtransClient = require("midtrans-client");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 5000;
const SERVER_KEY = process.env.SERVER_KEY;

app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

app.get("/", (req, res) => {
  res.send("Server running...");
});

app.get("/products", async (req, res) => {
  const productData = await db.from("products").select("*");
  res.json(productData);
});

app.post("/add-product", async (req, res) => {
  const { name, description, category, stock, price, image } = req.body;

  try {
    await db.from("products").insert({
      name,
      description,
      category,
      stock,
      price,
      image,
    });

    res.json("Data uploaded");
  } catch (e) {
    console.log(e);
  }
});

let snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: SERVER_KEY,
});

app.post("/checkout", async (req, res) => {
  const { order_id, product_id, product_name, price, product_quantity } =
    req.body;

  let transactionParameter = {
    transaction_details: {
      order_id: order_id,
      product_id: product_id,
      price: price,
      gross_amount: product_quantity * price,
    },
  };

  snap.createTransaction(transactionParameter).then((transaction) => {
    let transactionToken = transaction.token;
    console.log(transactionToken);

    res.json(transactionToken);
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
