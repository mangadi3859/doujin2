import { AxiosResponse, default as axios } from "axios";
import Pdf from "pdfjs";
import jimp from "jimp";
// import superAgent from "superagent";
// import agentProxy from "superagent-proxy";
import { Readable } from "stream";

// agentProxy(superAgent);

const INFORMATION_FILE = `This is Doujin Downloader made by I S L A\n\nYou Can also use my web to download doujin too...\n\n(https://isla-doujin.herokuapp.com)`;

/**
 * https://nhentai.net/api/gallery/${id}
 * https://i.nhentai.net/galleries/${res.data.media_id}/${i + 1}.jpg
 * https://i2.nhentai.net/galleries/${res.data.media_id}/${i + 1}.png
 */

interface IDoujinTitle {
    english: string;
    japanese: string;
    pretty: string;
}

type PageExt = "p" | "j";

interface IPage {
    t: PageExt;
    w: number;
    h: number;
}

interface IImages {
    pages: IPage[];
    cover: IPage;
    thumbnail: IPage;
}

type TagType = "parody" | "category" | "language" | "tag" | "character" | "group" | "artist";

interface ITag {
    d: number;
    type: TagType;
    name: string;
    url: string;
    count: number;
}

export interface INhentaiResponse {
    id: number;
    media_id: string;
    title: IDoujinTitle;
    images: IImages;
    scanlator?: string;
    upload_date: number;
    tags: ITag[];
    num_pages: number;
    num_favorites: number;
}

class NhentaiResponse {
    id: number;
    media_id: string;
    title: IDoujinTitle;
    images: IImages;
    scanlator?: string;
    upload_date: number;
    tags: ITag[];
    parodies: ITag[];
    characters: ITag[];
    artists: ITag[];
    groups: ITag[];
    languages: ITag[];
    categories: ITag[];
    num_pages: number;
    num_favorites: number;

    constructor(private readonly _nhentai: INhentaiResponse) {
        this.id = _nhentai.id;
        this.media_id = _nhentai.media_id;
        this.title = _nhentai.title;
        this.images = _nhentai.images;
        this.scanlator = _nhentai.scanlator;
        this.upload_date = _nhentai.upload_date;
        this.tags = _nhentai.tags.filter((f) => f.type === "tag");
        this.parodies = _nhentai.tags.filter((f) => f.type === "parody");
        this.characters = _nhentai.tags.filter((f) => f.type === "character");
        this.artists = _nhentai.tags.filter((f) => f.type === "artist");
        this.groups = _nhentai.tags.filter((f) => f.type === "group");
        this.languages = _nhentai.tags.filter((f) => f.type === "language");
        this.categories = _nhentai.tags.filter((f) => f.type === "category");
        this.num_pages = _nhentai.num_pages;
        this.num_favorites = _nhentai.num_favorites;
    }
}

/** Search Doujin from nhentai.net
 *
 * @param id
 * @returns
 *
 */
export async function search(id: string): Promise<NhentaiResponse> {
    if (!id) throw new TypeError("id is required");
    const regex = new RegExp(/^((?:https?:\/\/|www\.)?nhentai\.net\/g\/)?(\d+)/, "i");
    const code = id.match(regex);

    if (!code) throw new TypeError("Invalid id");
    id = id.replace(regex, "$2");
    // https://nhentai.net/api/gallery/${id}/
    // let res = <any>await superAgent.get(`https://nhentai.net/api/gallery/${id}`).catch(console.error);

    let res = <AxiosResponse<INhentaiResponse>>await axios.get(`https://nhentai.net/api/gallery/${id}`).catch((e) => console.log(e.toString()));

    return res?.data ? new NhentaiResponse(res.data) : null;
    // return res?.body ? new NhentaiResponse(res.body) : null;
}

/**Turn nhentai into zip
 *
 * @param {string} id - nhentai id
 */
export async function download(id: string, destination: Readable): Promise<void> {
    if (!id) throw new TypeError("id is required");
    id = id.toString();
    // const zip = new JsZip();
    const regex = new RegExp(/^((?:https?:\/\/|www\.)?nhentai\.net\/g\/)?(\d+)/, "i");
    const code = id.match(regex);

    if (!code) throw new TypeError("Invalid id");
    id = id.replace(regex, "$2");
    let res = (await axios.get<INhentaiResponse>("https://nhentai.net/api/gallery/" + id)).data;

    if (!res || !res.images) throw new Error("Doujin not found");
    const folder = `[ISLA-DOUJIN] ${res.title.pretty} (${res.id})`;
    // zip.folder(folder);

    let promises = res.images.pages.map(async (obj, i) => {
        switch (obj.t) {
            case "j": {
                var buf = await axios.get(`https://i.nhentai.net/galleries/${res.media_id}/${i + 1}.jpg`, { responseType: "arraybuffer", timeout: 5000 }).catch((err) => {
                    console.log(err.message);
                    return null;
                });
                break;
            }

            case "p": {
                let img = await jimp.read(`https://i2.nhentai.net/galleries/${res.media_id}/${i + 1}.png`);

                var buf = <any>await img.getBufferAsync("image/jpeg");
                break;
            }
        }

        if (!buf) return null;
        let { h, w } = res.images.pages[i];
        let doc = new Pdf.Document({ height: h, width: w, font: null });
        doc.image(new Pdf.Image(buf.data), { align: "center" });

        return doc.asBuffer();
    });

    let meta = { author: "isla", creator: "isla", subject: "Doujin", title: folder };
    let pdf = new Pdf.Document({ properties: meta, font: null });
    pdf.pipe(destination, { end: true });
    let resolve = await Promise.all(promises);

    pdf.text(INFORMATION_FILE);
    resolve.forEach((buffer, index) => {
        if (!buffer) return;
        let image = new Pdf.ExternalDocument(buffer);
        pdf.addPagesOf(image);
    });

    pdf.end();
    // const finalFile = await zip.generateAsync({ type: "arraybuffer" });

    return;
}

declare global {
    interface SuperAgentStatic {
        proxy(host: string);
    }
}
