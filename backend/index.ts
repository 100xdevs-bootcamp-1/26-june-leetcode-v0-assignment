import express from "express";
import { createClient } from "redis";
import { prisma } from "./db";
import cors from "cors";

const client = createClient();
client.connect();

const app = express()

app.use(express.json())
app.use(cors())

app.post("/submission", async (req, res) => {
    const code = req.body.code;
    const language = req.body.language;

   const response = await prisma.submissions.create({
        data: {
            language,
            code,
            status: "Processing"
        }
    })
    // put this entry in the DB
    client.lPush("problems", JSON.stringify({submissionId: response.id, code, language}))

    res.json({
        message: "processing",
        id: response.id
    })
})

app.get("/submission/:submissionId", async (req, res) => {
    const response = await prisma.submissions.findFirst({
        where: {
            id: req.params.submissionId
        }
    })

    res.json({
        submission: response
    })
})


app.listen(3000);