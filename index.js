import express from "express";
import api from "./api/index.js";
import users from "./users/index.js";

const port = process.env.PORT || 4000;

const app = express();

app.use((req, res, next) => {
    //console.log(
    //    req.url,
    //    req.headers.authorization,
    //    process.env.AUTHORIZATION,
    //    req.headers.authorization === process.env.AUTHORIZATION,
    //    req.headers.token
    //);

    if (req.headers.authorization !== process.env.AUTHORIZATION) {
        return res.status(401).json({ error: "unauthorized" });
    } 

    return next();
});

app.use("/api/data-api", api);
app.use("/api/users-api", users);

app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
    console.log(`http://localhost:${port}`);
});
