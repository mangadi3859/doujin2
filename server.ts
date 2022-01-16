//Libraries
import express from "express";
// import * as fs from "fs";
// import axios from "axios";
import { join as pathJoin } from "path";
import { config } from "dotenv";

//Modules
import ApiRouter from "./routes/api";
import DownloadRouter from "./routes/download";
import SearchRouter from "./routes/search";
import { Utils } from "./lib/Nhentai";

//Constants
config();
const app = express();
const ROOT = pathJoin(__dirname, "public");
const VIEW_ROOT = pathJoin(__dirname, "src", "views");
const PORT = process.env.PORT || 3000;

//Initalization
app.set("view engine", "ejs");
app.set("views", VIEW_ROOT);

app.use("/public", express.static(ROOT));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routers
app.get("/public", (req, res) => res.sendStatus(403));
app.get("/public/**", (req, res) => res.sendStatus(403));
app.get("/", (req, res) => res.render("index"));
app.use("/api", ApiRouter);
app.use("/download", DownloadRouter);
app.use("/search", SearchRouter);

//Fallback
app.use((req, res) => {
    res.status(404).render("error", { error: "Error 404", title: "Error 404", message: "Page Not Found", description: "Page Not Found" });
});

//Run
app.listen(PORT, () => console.log(`App is on port: ${PORT}`));

//Declare
declare global {
    namespace Express {
        interface Request {
            [key: string]: any;
            relatedDoujin: Utils.NhentaiRelatedResponse;
        }
    }
}
