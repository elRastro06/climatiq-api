import express from "express";
import cors from "cors";
import v1 from "./v1.mjs";
import v2 from "./v2.mjs";

const app = express();
const port = 5003;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
    console.log(`Now listening on port ${port}`);
});

app.use("/v1", v1);
app.use("/v2", v2);