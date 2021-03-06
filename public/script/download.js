let table = $("[data-tag-value]");
let related = $("[data-doujins");
let templateDoujin = $("[data-doujin-template]")[0];

table.each((i, el) => {
    !el.querySelector("a.badge") && (el.parentElement.hidden = true);
});

fetch(`/api/getRelated?id=${$("[data-doujin-id")[0].value}`)
    .then((r) => r.json())
    .then((res) => {
        res.result.forEach((e) => {
            let node = templateDoujin.content.cloneNode(true);
            node.querySelector("a").href = `/download?id=${e.id}`;
            node.querySelector("[data-card-cover]").src = `/api/thumbnail/${e.media_id}/${e.images.cover.t === "j" ? "jpg" : "png"}`;
            node.querySelector("[data-card-title]").innerText = `${e.title.pretty}`;
            node.querySelector("[data-card-language]").innerText = e.languages.filter((e) => e.name !== "translated")[0]?.name || "??";
            related.append(node);
        });
    })
    .catch(console.error);
