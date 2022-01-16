import express, { Request, NextFunction, Response } from "express";
import { search, download, Utils } from "../lib/Nhentai";

// Path /api
const router = express.Router();

//Routes
router.get("/", async (req, res) => {
    let { id } = req.query;
    if (!id) return res.status(400).render("error", { title: "Error 400", error: "Error 400", message: "Missing required parameter 'id'", description: "Bad Request" });
    let doujin = await search(<string>id);

    if (!doujin?.id) return res.status(404).render("error", { error: "Error 404", title: "Error 404", message: "Doujin Not Found", description: "Doujin Not Found" });

    // let thumb64 = await axios.get(`https://i2.nhentai.net/galleries/${doujin.media_id}/1.${doujin.images.pages[0].t === "j" ? "jpg" : "png"}`, { responseType: "arraybuffer" });
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
        // thumb64: `data:image/jpeg;base64,${Buffer.from(thumb64.data).toString("base64")}`,
        thumb64: `/api/cover/${doujin.media_id}/${doujin.images.cover.t === "j" ? "jpg" : "png"}`,
    });
});

router.post("/action", checkData, (req, res) => {
    res.attachment(`[ISLA-DOUJIN] ${req.nhentai.title} - (${req.nhentai.id}).pdf`);
    res.set("Content-Type", "file/pdf");

    download(req.nhentai.id, res).catch((err) => {
        console.error(err);
    });
});

async function checkData(req, res, next) {
    const { id } = req.body;
    try {
        let res = await search(id);
        req.nhentai = { id: res.id, title: res.title.pretty.replace(/[^\w\s\d%.,\-?!+_]/g, "") };
        return next();
    } catch (err) {
        console.error(err);
        return res.status(500).render("error", { title: "Internal Server Error", error: "Error 500", message: "Internal Server Error", description: "Internal Server Error" });
    }
}

export default router;
