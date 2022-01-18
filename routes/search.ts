import express, { Request, NextFunction, Response } from "express";
import { Utils, query as searchByTerm } from "../lib/Nhentai";

import axios from "axios";

// Path /api
const router = express.Router();

//Routes
router.get("/", (req, res) => {
    res.render("search");
});

router.get("/advance", (req, res) => {
    res.render("advance");
});

router.get("/results", async (req, res) => {
    let { sort, query } = req.query;
    if (!query) return res.status(400).render("error", { title: "Error 400", error: "Error 400", message: "Missing required parameter 'query'", description: "Bad Request" });
    if ((<string>query).trim().match(/^\d+$/)) return res.redirect(`/download?id=${query}`);
    let doujin: Utils.NhentaiQueryResponse = await searchByTerm(<string>query, { sort: <Utils.Popular>sort });

    if (!doujin?.result.length) return res.status(404).render("error", { title: "Query Results", error: "Result Not Found", message: "Oops, we can't find any doujin that match your query", description: "Results Not Found" });
    return res.render("results", { pages: doujin.num_pages, query: req.query, doujin });
});

export default router;
