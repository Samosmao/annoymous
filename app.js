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
        if (!md5) {
            return res.json({ success: false, error: "ខ្វះ MD5" });
        }

        // ប្រើ Relay endpoint ជំនួស Bakong ផ្ទាល់
        const relayUrl = "https://api.bakongrelay.com/v1/check_transaction_by_md5";  

        const response = await axios.post(
            relayUrl,
            { md5: md5 },
            {
                headers: {
                    'Authorization': `Bearer rbkOWCSsR2kJVOkRT_r88q7S__IOFIdAk3cRuAz07p-FMQ`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log("Relay Response:", JSON.stringify(response.data, null, 2));

        // ពិនិត្យ responseCode (ជាទូទៅដូចគ្នា)
        const isPaid = response.data.responseCode === 0 || response.data.responseCode === "0";

        res.json({
            success: isPaid,
            details: response.data  // សម្រាប់ debug
        });

    } catch (err) {
        console.error("Relay Error:", err.response?.status, err.response?.data || err.message);
        res.json({
            success: false,
            error: "មានបញ្ហាជាមួយ Bakong Relay",
            status: err.response?.status
        });
    }
});

app.get('/Health', (req,res) => {
    res.status(200).send('Server der');
});
