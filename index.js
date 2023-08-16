const express = require("express")
const {google} = require("googleapis")
require("dotenv").config()
const fs = require('fs');

const app = express()

app.set("view engine", "ejs");
// app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const Port = process.env.PORT || 3000

app.get("/", (req, res) => {
    res.render("index")
});

app.post("/getShuffle", async (req, res) => {

    const auth = new google.auth.GoogleAuth({
        keyFile: "credentials.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets"
    })

    const client = await auth.getClient() 
    const googleSheets = google.sheets({version: "v4", auth: client})
    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId: process.env.SHEET_ID,
        range: "Sheet1!B:C"
    });

    let rows = (getRows.data.values)
    
    rows.shift()

    const regex = /^(22|23)[A-Za-z]{3,4}\d{3}$/;

    rows = rows.filter((row) => {
        row[1] = row[1].toUpperCase()
        return regex.test(row[1])
    });
    // shuffle the array

    for (let i = rows.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [rows[i], rows[j]] = [rows[j], rows[i]];
    }

    // make group of 5
    const groups = [];
  
    for (let i = 0; i < rows.length; i += 5) {
        groups.push(rows.slice(i, i + 5));
    }

    // res.send(groups)
    return res.render("template.ejs", { data:groups });
});

app.listen(Port, (err)=>{
    if(err) throw err;
    console.log(`Server is running on port ${Port}`)
})