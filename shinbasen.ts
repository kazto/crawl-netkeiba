import {
    DOMParser,
    Element,
    HTMLDocument,
} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const fetchData = async () => {
    const formData = new FormData();
    [ "01", "02", "03", "04", "05", "06", "07", "08", "09", "10"].map((v) => formData.append("jyo[]", v));
    formData.append("grade[]", "8");
    formData.append("list", "100");
    formData.append("pid", "race_list");
    
    let resp = fetch("https://db.netkeiba.com", {
        method: "POST",
        body: formData
    });
    
    return (await resp).text();
};

const getHorseData = (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const links = doc.getElementsByTagName("a");
    
    const hrefs = links.map((v) => v.attributes.getNamedItem("href").value).filter((v) => v.includes("/horse/"));
    //hrefs.map((v) => console.log(v));
    return hrefs;
}

const convertCodePoints = (str: string) => {
    return Array.from(str).map((c) => c.codePointAt(0));
}

const getHorseName = (doc: HTMLDocument) => {
    const name = doc.querySelector(".horse_title h1").innerHTML
    console.log(name);
    const cp = convertCodePoints(name);
    console.log(cp);

    const encoder = new TextEncoder();
    const bytes = encoder.encode(name);
    console.log(bytes);
    const decorder = new TextDecoder("EUC-JP");

    return decorder.decode(bytes);
}

const getHorsePrice = (doc: HTMLDocument) => {

}

const getHorseParents = (doc: HTMLDocument) => {

}

const getHorseRecords = (doc: HTMLDocument) => {

}

const getHorseInfo = async (url: string) => {
    let resp = await fetch("https://db.netkeiba.com" + url);
    const html = await resp.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const horseName = getHorseName(doc);
    const horsePrice = getHorsePrice(doc);
    const horseParents = getHorseParents(doc);
    const horseRecords = getHorseRecords(doc);

    return {
        name: horseName,
        price: horsePrice,
        parents: horseParents,
        records: horseRecords
    };
}

const html = await fetchData();
const horses = getHorseData(html);

const x = horses.slice(0, 2);

console.log(x);
const infos = x.map(async (v) => {
    const a = await getHorseInfo(v);
    console.log(a);
    return a;
});

console.log(infos);
