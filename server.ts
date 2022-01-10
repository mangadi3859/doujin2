//Library
import express, { Request, NextFunction, Response } from "express";
import * as fs from "fs";
import { join as pathJoin } from "path";
import { config } from "dotenv";

//Module
import {} from "./lib/nhentai";

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

//Fallback
app.use((req, res) => {
    res.status(404).render("error", { error: "Error 404", title: "Error 404", message: "Page Not Found" });
});

//Run
app.listen(PORT, () => console.log(`App is on port: ${PORT}`));
