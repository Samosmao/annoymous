const { default: axios } = require("axios");
const { khqrData, IndividualInfo, SourceInfo, BakongKHQR } = require("bakong-khqr");
const express = require("express");
const cors = require("cors")

const app = express();
app.listen(process.env.PORT || 80, () => console.log("Server is running...!"));
app.use(express.json());
app.use(cors({
    origin: [
        "https://annoymous.vercel.app"
    ],
    credentials: true,
}));

app.post("/api/generatekhqr", (req, res) => {
    const { price, planName } = req.body
    const storeName = "Annoymous Shop"

    const khqr = new BakongKHQR()

    const optionalData = {
        currency: khqrData.currency.usd,
        amount: price,
        billNumber: planName,
        storeLabel: storeName,
        terminalLabel: planName,
    };

    const individualInfo = new IndividualInfo(
        "mao_samos@bkrt",
        storeName,
        "Phnom Penh",
        optionalData
    )

    const dataKHQR = khqr.generateIndividual(individualInfo)

    const data = {
        price,
        qr: dataKHQR.data.qr,
        md5: dataKHQR.data.md5,
    }


    res.json({
        data
    })
})


app.post("/api/checkkhqr", async (req, res) => {
  try {
    const md5 = req.body.md5;
    if (!md5) return res.json({ success: false, error: "Missing md5" });

    const response = await axios.post(
      "https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5",
      { md5 },
      {
        headers: {
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiM2E5MjA5NjhkMTg1NDAyOCJ9LCJpYXQiOjE3NzA1ODI0NDgsImV4cCI6MTc3ODM1ODQ0OH0.pAfaIvrQMY31RHZk55o9o0tUh_82JAhk6rnYoUUq2iI`, 
          "Content-Type": "application/json",
        },
      }
    );

    const apiData = response.data;

    console.log("Bakong response:", JSON.stringify(apiData, null, 2)); // ← very important!

    // Typical success condition people use:
    const isPaid =
      apiData.responseCode === 0 ||
      apiData.responseCode === "0" ||
      (apiData.data && apiData.data.transaction); // more reliable in some cases

    res.json({
      success: !!isPaid,
      // optional debug help
      responseCode: apiData.responseCode,
      hasTransaction: !!apiData?.data?.transaction,
    });

  } catch (err) {
    console.error("Bakong check error:", err?.response?.data || err.message);
    res.json({
      success: false,
      error: err.message,
    });
  }
});

app.get('/Health', (req,res) => {
    res.status(200).send('Server der');
});
