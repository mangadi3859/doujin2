import express, { Request, NextFunction, Response } from "express";
import { getRelated, Utils, query as searchByTerm } from "../lib/Nhentai";
import axios from "axios";

// Path /api
const router = express.Router();
enum ErrorCode {
    BAD_REQUEST = Object({ message: "Bad Request", code: 400 }),
    NOT_FOUND = Object({ message: "Not Found", code: 404 }),
    FORBIDDEN = Object({ message: "Forbidden", code: 403 }),
    UNAUTHORIZED = Object({ message: "Unauthorized", code: 401 }),
    SERVER_ERROR = Object({ message: "Server Error", code: 500 }),
    PATH_NOT_FOUND = Object({ message: "Path Not Found", code: 404 }),
}

//Routes
router.get("/", (req, res) => {
    res.json({ message: "Yay, you found our REST API" });
});

router.get("/thumbnail/:media/:ext", async (req, res) => {
    let { media, ext } = req.params;
    if (!media || !ext) return res.status(400).json(ErrorCode.BAD_REQUEST);
    if (!["jpg", "png"].includes(ext)) return res.status(400).json(ErrorCode.BAD_REQUEST);
    let thumb = await axios.get(`https://t.nhentai.net/galleries/${media}/thumb.${ext}`, { responseType: "arraybuffer" }).catch((e) => e);
    if (!thumb?.data) return res.status((<any>res).code == 404 ? 404 : 500).json((<any>res).code == 404 ? ErrorCode.NOT_FOUND : ErrorCode.SERVER_ERROR);

    // const thumb64 = `data:image/${ext};base64,${Buffer.from(thumb.data).toString("base64")}`;
    let thumb64 = Buffer.from(thumb.data, "base64");
    res.set("Content-Length", thumb64.length.toString())
        // .attachment(`thumbnail.${ext == "jpg" ? "jpeg" : "png"}`)
        .contentType(`image/${ext == "jpg" ? "jpeg" : "png"}`)
        .send(thumb64);
});

router.get("/cover/:media/:ext", async (req, res) => {
    let { media, ext } = req.params;
    if (!media || !ext) return res.status(400).json(ErrorCode.BAD_REQUEST);
    if (!["jpg", "png"].includes(ext)) return res.status(400).json(ErrorCode.BAD_REQUEST);
    let thumb = await axios.get(`https://t2.nhentai.net/galleries/${media}/cover.${ext}`, { responseType: "arraybuffer" }).catch((e) => e);
    if (!thumb?.data) return res.status((<any>res).code == 404 ? 404 : 500).json((<any>res).code == 404 ? ErrorCode.NOT_FOUND : ErrorCode.SERVER_ERROR);

    // const thumb64 = `data:image/${ext};base64,${Buffer.from(thumb.data).toString("base64")}`;
    let thumb64 = Buffer.from(thumb.data, "base64");
    res.set("Content-Length", thumb64.length.toString())
        .header("title", "test")
        // .attachment(`cover.${ext == "jpg" ? "jpeg" : "png"}`)
        .contentType(`image/${ext == "jpg" ? "jpeg" : "png"}`)
        .send(thumb64);
});

router.get("/getRelated", checkRelatedPayload, (req, res) => {
    res.json(req.relatedDoujin);
});

router.get("/search", checkQueryPayload, (req, res) => {
    let doujin: Utils.NhentaiQueryResponse = req["queryResult"];
    res.json(doujin);
});

//Fallback
router.use((req, res) => {
    res.status(404).json(ErrorCode.PATH_NOT_FOUND);
});

//Custom Middleware
async function checkRelatedPayload(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { id } = req.query;
    if (!id) return res.status(400).json(ErrorCode.BAD_REQUEST);
    let doujin = await getRelated(<string>id);

    if (!doujin) return res.status(404).json(ErrorCode.NOT_FOUND);
    req.relatedDoujin = doujin;
    return next();
}

async function checkQueryPayload(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { query, sort, page } = req.query;
    if (!query) return res.status(400).json(ErrorCode.BAD_REQUEST);
    let doujin = await searchByTerm(<string>query, { sort: <Utils.Popular>sort ?? "", page: parseInt(<string>page) || null}).catch(console.error);
    if (!doujin) return res.status(404).json(ErrorCode.NOT_FOUND);

    req["queryResult"] = doujin;
    return next();
}

export default router;
