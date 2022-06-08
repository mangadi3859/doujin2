import { AxiosResponse, default as axios } from "axios";
import Pdf from "pdfjs";
import jimp from "jimp";
// import superAgent from "superagent";
// import agentProxy from "superagent-proxy";
import * as Utils from "./utils";
import { Writable } from "stream";

// agentProxy(superAgent);

/** Search Doujin from nhentai.net
 *
 * @param id
 * @returns
 *
 */
export async function search(id: string): Promise<Utils.NhentaiResponse> {
    if (!id) throw new TypeError("id is required");
    const regex = new RegExp(/^((?:https?:\/\/|www\.)?nhentai\.net\/g\/)?(\d+)/, "i");
    const code = id.match(regex);

    if (!code) throw new TypeError("Invalid id");
    id = id.replace(regex, "$2");
    // https://nhentai.net/api/gallery/${id}/
    // let res = <any>await superAgent.get(`https://nhentai.net/api/gallery/${id}`).catch(console.error);

    let res = <AxiosResponse<Utils.INhentaiResponse>>await axios.get(`https://nhentai.net/api/gallery/${id}`).catch((e) => console.log(e.toString()));

    return res?.data ? new Utils.NhentaiResponse(res.data) : null;
    // return res?.body ? new NhentaiResponse(res.body) : null;
}

/**Turn nhentai into zip
 *
 * @param {string} id - nhentai id
 */
export async function download(id: string, destination: Writable): Promise<void> {
    if (!id) throw new TypeError("id is required");
    id = id.toString();
    // const zip = new JsZip();
    const regex = new RegExp(/^((?:https?:\/\/|www\.)?nhentai\.net\/g\/)?(\d+)/, "i");
    const code = id.match(regex);

    if (!code) throw new TypeError("Invalid id");
    id = id.replace(regex, "$2");
    let res = (await axios.get<Utils.INhentaiResponse>("https://nhentai.net/api/gallery/" + id)).data;

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
                let imgBuf = await img.getBufferAsync("image/jpeg");

                var buf: any = img && imgBuf ? { data: <any>imgBuf } : null;
                break;
            }
        }

        if (!buf) return null;
        let { h, w } = res.images.pages[i];
        let doc = new Pdf.Document({ height: h, width: w, font: null });
        doc.image(new Pdf.Image(buf.data), { align: "center" });

        let resImage = await doc.asBuffer();
        //doc.end();
        //buf = null;
        return resImage;
    });

    //WOI
    let meta = { author: "isla", creator: "isla", subject: "Doujin", title: folder };
    let pdf = new Pdf.Document({ properties: meta, font: null });
    pdf.pipe(destination, { end: true });
    let resolve = await Promise.all(promises);

    //pdf.text(Utils.INFORMATION_FILE, { textAlign: "center", alignment: "center", link: "https://isla-doujin.herokuapp.com", color: 0x1f1f1f });
    resolve.forEach((buffer, index) => {
        if (!buffer) return;
        let image = new Pdf.ExternalDocument(buffer);
        buffer = null;
        pdf.addPagesOf(image);
    });

    pdf.end();
    // const finalFile = await zip.generateAsync({ type: "arraybuffer" });

    return;
}

export async function query(query: string, options: Utils.IQueryOptions = {}): Promise<Utils.NhentaiQueryResponse> {
    let data = query;
    let params = new URLSearchParams([["query", data], ...Object.keys(options).map((e) => [e, options[e]])]);
    let res = await await axios.get<Utils.INhentaiQueryResponse>(`https://nhentai.net/api/galleries/search?${params.toString()}`).catch(() => null);

    return res?.data ? new Utils.NhentaiQueryResponse(res.data) : null;
}

export async function getRelated(id: number | string): Promise<Utils.NhentaiRelatedResponse> {
    let res = await axios.get<Utils.INhentaiRelatedResponse>(`https://nhentai.net/api/gallery/${id}/related`).catch(() => null);

    return res?.data ? new Utils.NhentaiRelatedResponse(res.data) : null;
}

export { Utils };
