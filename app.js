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

app.post("/generatekhqr", (req, res) => {
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


app.post("/checkkhqr", (req, res) => {
    const headers = {
        headers: {
            'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7ImlkIjoiM2E5MjA5NjhkMTg1NDAyOCJ9LCJpYXQiOjE3NzA1ODI0NDgsImV4cCI6MTc3ODM1ODQ0OH0.pAfaIvrQMY31RHZk55o9o0tUh_82JAhk6rnYoUUq2iI.eyJkYXRhIjp7ImlkIjoiMzYzZmY2ODQ4MDdhNGUzIn0sImlhdCI6MTcyMjI4NzA3NCwiZXhwIjoxNzMwMDYzMDc0fQ.h-rECLcYYRvxFsbW6vqllC-hXgDUzc3dHa-IarPjKH0`,
            'Content-Type': 'application/json'
        }
    }
    const data = {
        md5: req.body.md5
    }
    axios.post("https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5", data, headers).then(async (result) => {
        if (result.data.responseCode == 0) {
            if (result.data) {

                //do something

                res.json({
                    success: true
                })
            }
        } else {
            res.json({
                success: false
            })
        }
    }).catch((e) => {
        res.json({
            success: false
        })
    })
})
