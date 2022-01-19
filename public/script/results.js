let templateDoujin = $("[data-doujin-template]")[0];
let templateSeparator = $("[data-separator-template]")[0];
let related = $("[data-doujins]");
let btnAdd = $("[data-add]");
let btnDown = $("[data-btn-down]");

btnAdd.on("click", async (e) => {
    let page = related.data("doujins");
    let numPages = related.data("page");
    let params = new URLSearchParams(window.location.search);

    if (btnAdd.hasClass("limit")) return;

    // params.set("page", 2);
    // console.log(params.toString());

    try {
        params.set("page", ++page);
        $("[data-page-count] [data-current]").text(page);
        let data = await (await fetch(`/api/search/?${params.toString()}`)).json();
        related.data("doujins", page);

        if (!numPages) related.data("page", data.num_pages);
        if (page >= numPages) btnAdd.addClass("limit");

        // related.append(document.createElement("br"));
        let separator = templateSeparator.content.cloneNode(true);
        separator.querySelector("[data-separator-text]").innerText = `Page ${page}`;
        related.append(separator);

        for (let e of data.result) {
            let node = templateDoujin.content.cloneNode(true);
            node.querySelector("a").href = `/download?id=${e.id}`;
            node.querySelector("[data-card-cover]").src = `/api/thumbnail/${e.media_id}/${e.images.cover.t === "j" ? "jpg" : "png"}`;
            node.querySelector("[data-card-title]").innerText = `${e.title.pretty}`;
            node.querySelector("[data-card-language]").innerText = e.languages.filter((e) => e.name !== "translated")[0]?.name || "??";
            related.append(node);
        }

        // data.result.forEach((e) => {
        //     let node = templateDoujin.content.cloneNode(true);
        //     node.querySelector("a").href = `/download?id=${e.id}`;
        //     node.querySelector("[data-card-cover]").src = `/api/thumbnail/${e.media_id}/${e.images.cover.t === "j" ? "jpg" : "png"}`;
        //     node.querySelector("[data-card-title]").innerText = `${e.title.pretty}`;
        //     node.querySelector("[data-card-language]").innerText = e.languages.filter((e) => e.name !== "translated")[0]?.name || "??";
        //     related.append(node);
        // });
    } catch (e) {
        console.error(e);
    }
});

let par = new URLSearchParams(window.location.search).get("sort");
if (par === "popular") $('[data-sort="popular"]').addClass("active");
else if (par === "popular-week") $('[data-sort="popular-today"]').addClass("active");
else if (par === "popular-today") $('[data-sort="popular-today"]').addClass("active");
else $('[data-sort="recent"]').addClass("active");

let btnObserver = new IntersectionObserver(
    (entries) => {
        let btn = entries[0];
        if (!btn.isIntersecting) return btnDown.addClass("active");
        btnDown.removeClass("active");
    },
    { threshold: 0, rootMargin: "200px" },
);

btnObserver.observe(btnAdd[0]);

export {};
