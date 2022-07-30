import {
    DOMParser,
    Element,
    HTMLDocument,
} from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const fetchRaceTable = async () => {
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

const getHorseName = (doc: HTMLDocument) => {
    const tag = doc.querySelector(".horse_title h1");
    return tag.textContent;
}

const getHorsePrice = (doc: HTMLDocument) => {
    const tbody = doc.querySelector(".db_prof_area_02 table tbody");
    const tr = tbody.querySelector("tr + tr + tr + tr + tr + tr");
    const price = tr.querySelector("td").textContent.trim();
    return price;
}

const getHorseParents = (doc: HTMLDocument) => {
    const tbody = doc.querySelector("table.blood_table tbody");
    const ml = tbody.querySelector("tr td.b_ml");
    const fml = tbody.querySelector("tr + tr + tr td.b_fml");
    return {
        "ml": {
            "link": ml.querySelector("a").getAttribute("href"),
            "name": ml.querySelector("a").textContent,
        },
        "fml": {
            "link": fml.querySelector("a").getAttribute("href"),
            "name": fml.querySelector("a").textContent,
        }
    };
}

const pickTableElement = (n: Number) => {
    let result = "td";
    for(let i = 0; i < n; i++) {
        result += " + td";
    };
    return result;
}

interface Race {
    name: string,
    link: string,
};
interface Jockey {
    name: string,
    link: string,
};
interface Record {
    race: Race,
    horseNumber: number,
    fav: number,
    rank: number,
    jockey: Jockey,
    handicap: number,
    raceLength: string,
    raceCondition: string,
    raceTime: string,
    weight: string,
};

const getHorseRecords = (doc: HTMLDocument) => {
    const tbody = doc.querySelector("table.db_h_race_results.nk_tb_common tbody") as Element;
    const trs = tbody.querySelectorAll("tr") as NodeList;
    let records = [] as Record[];
    for(let i = 0; i < trs.length; i++) {
        const tr = trs.item(i) as Element;
        if(tr == null) break;
        const race = tr.querySelector(pickTableElement(1)) as Element;
        const horseNumber = tr.querySelector(pickTableElement(8)) as Element;
        const fav = tr.querySelector(pickTableElement(10)) as Element;
        const rank = tr.querySelector(pickTableElement(11)) as Element;
        const jockey = tr.querySelector(pickTableElement(12)) as Element;
        const handicap = tr.querySelector(pickTableElement(13)) as Element;
        const raceLength = tr.querySelector(pickTableElement(14)) as Element;
        const raceCondition = tr.querySelector(pickTableElement(15)) as Element;
        const raceTime = tr.querySelector(pickTableElement(17)) as Element;
        const weight = tr.querySelector(pickTableElement(23)) as Element;
        const record = <Record>{
            race: {name: race.textContent, link: race.querySelector("a").getAttribute("href")},
            horseNumber: Number(horseNumber.textContent),
            fav: Number(fav.textContent),
            rank: Number(rank.textContent),
            jockey: {name: jockey.textContent.trim(), link: jockey.querySelector("a").getAttribute("href")},
            handicap: Number(handicap.textContent),
            raceLength: raceLength.textContent,
            raceCondition: raceCondition.textContent,
            raceTime: raceTime.textContent,
            weight: weight.textContent,
        }
    
        records.push(record);
    }
    return records;
}

const readBlob = (blob: Blob, encode: string) => {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
            resolve(reader.result);
        };
        reader.readAsText(blob, encode);
    });
};

const getHorseInfo = async (url: string) => {
    let resp = await fetch("https://db.netkeiba.com" + url);
    const blob = await resp.blob();
    const html = await readBlob(blob, "euc-jp");

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

const getWonHorses = async () => {
    const html = await fetchRaceTable();
    const horses = getHorseData(html);
    
    const x = horses.slice(0, 2);
    
    const infos = x.map(async (v) => {
        const a = await getHorseInfo(v);
        console.log(a);
        return a;
    });

    
}

const getRaces = async (html: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const links = doc.getElementsByTagName("a");
    
    const hrefs = links.map((v) => v.attributes
        .getNamedItem("href").value)
        .filter((v) => !(v.includes("/race/list/") || v.includes("/race/sum/")))
        .filter((v) => v.includes("/race/"));
    //hrefs.map((v) => console.log(v));
    return hrefs;
}

const main = async () => {
    const html = await fetchRaceTable();
    const races = await getRaces(html);

    const x = races.slice(0,2);


}