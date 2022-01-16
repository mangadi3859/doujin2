export const INFORMATION_FILE = `This doujin is downloaded from \n\nhttps://isla-doujin.herokuapp.com\n\nCreated With 💗 by ISLA`;

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
    id: number;
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

export class NhentaiResponse {
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

    constructor(private _nhentai: INhentaiResponse) {
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

        delete this._nhentai;
    }
}

export type Popular = "popular" | "popular-week" | "popular-today" | "";

export interface IQueryOptions {
    sort?: Popular;
    page?: number;
    language?: string;
}

export interface INhentaiQueryResponse {
    num_pages: number;
    per_page: number;
    result: INhentaiResponse[];
}

export class NhentaiQueryResponse {
    num_pages: number;
    per_page: number;
    result: NhentaiResponse[];

    constructor(private _nhentai: INhentaiQueryResponse) {
        this.num_pages = _nhentai.num_pages;
        this.per_page = _nhentai.per_page;
        this.result = _nhentai.result.map((e) => new NhentaiResponse(e));

        delete this._nhentai;
    }
}

export interface INhentaiRelatedResponse extends INhentaiQueryResponse {
    per_page: never;
    num_favor: number;
}

export class NhentaiRelatedResponse extends NhentaiQueryResponse {
    declare per_page: never;
    public num_favor: number;

    constructor(_nhentai: INhentaiRelatedResponse) {
        super(_nhentai);
        this.num_favor = _nhentai.num_favor;
    }
}
