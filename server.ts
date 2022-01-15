//Library
import express, { Request, NextFunction, Response } from "express";
// import * as fs from "fs";
import axios from "axios";
import { join as pathJoin } from "path";
import { config } from "dotenv";

//Module
import ApiRouter from "./route/api";
import { search, Utils } from "./lib/Nhentai";

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
app.use("/api", ApiRouter);

app.get("/public", (req, res) => {
    res.sendStatus(403);
});

app.get("/public/**", (req, res) => {
    res.sendStatus(403);
});

app.get("/", (req, res) => {
    res.render("index");
});

app.get("/search", (req, res) => {
    res.render("search");
});

app.get("/download", async (req, res) => {
    let { id } = req.query;
    if (!id) return res.status(400).render("error", { title: "Error 400", error: "Error 400", message: "Missing required parameter 'id'", description: "Bad Request" });
    // console.log(id);
    let doujin = await search(<string>id);
    // console.log(doujin);

    if (!doujin?.id) return res.status(404).render("error", { error: "Error 404", title: "Error 404", message: "Doujin Not Found", description: "Doujin Not Found" });

    let thumb64 = await axios.get(`https://i2.nhentai.net/galleries/${doujin.media_id}/1.${doujin.images.pages[0].t === "j" ? "jpg" : "png"}`, { responseType: "arraybuffer" });
    res.render("download", {
        id: doujin.id.toString(),
        title: doujin.title.pretty,
        parodies: doujin.parodies,
        artists: doujin.artists,
        categories: doujin.categories,
        characters: doujin.characters,
        languages: doujin.languages,
        groups: doujin.groups,
        tags: doujin.tags,
        pageCount: doujin.num_pages,
        thumb64: `data:image/jpeg;base64,${Buffer.from(thumb64.data).toString("base64")}`,
        // thumb64: `https://i2.nhentai.net/galleries/${doujin.media_id}/cover.${doujin.images.cover.t === "j" ? "jpg" : "png"}`,
    });
});

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
