/// Map modes
const MapMode = Object.freeze({
    Markers: Symbol("markers"),
    Normal: Symbol("normal"),
});


// latitude and longitude coordinates
let latLongCords = L.latLng(0, 0);
let showMarkers = true;

function createMap() {
    var map = L.map('map').setView([0.0236, 37.9062], 6.4);


    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);
    return map;

}


function createSingleNode(key, value, tableElement) {
    const tr = tableElement.insertRow();
    const td1 = tr.insertCell();
    td1.innerText = key;

    const td2 = tr.insertCell();
    td2.innerText = value;
    td2.style.overflow = "hidden";

}


function createSinglePhoneNode(key, value, tableElement) {
    const tr = tableElement.insertRow();
    const td1 = tr.insertCell();
    td1.innerText = key;
    const td2 = tr.insertCell();
    if (value == null) {
        td2.innerText = "UNKNOWN";
    } else {
        td2.innerHTML = "<a href='" + "tel:0" + value + "'>+254" + value + "<a/>";
    }
}

function createSingleLinkNode(key, value, tableElement) {
    const tr = tableElement.insertRow();
    const td1 = tr.insertCell();
    const relation = value.toString().split("/").slice(-1)[0];
    td1.innerHTML = `<p>${key} <i class="fa fa-external-link" aria-hidden="true"></i></p>`;
    const td2 = tr.insertCell();
    td2.innerHTML = "<a  target='_blank' href=" + value + ">" + relation + "<a/>";

}

function moveMap(map, item, lat, long) {
    if (lat === 0.0 || long === 0.0) {
        return;
    }
    let latOn = L.latLng(lat, long)

    if (!latOn.equals(latLongCords)) {
        map.flyTo(latOn, 14);
        L.popup(latOn, {
            content: `<p> Constituency: ${item['CONSTITUENCY']}\nMP: ${item['NAME']} </p>`,
        }).openOn(map);
        latLongCords = latOn

    }
}

function createTable(map, json, {text, politicalPartyFilter, statusFilter, voteFilter}) {
    const elements = document.getElementById("table-class")
    // clear anything that was previously there as we are adding new entries
    // this allows the filtering to work
    elements.innerHTML = "<div id='container-anchor'></div>"

    const filterByText = text.toString().toLowerCase()
    const filterByParty = politicalPartyFilter.toString().toLowerCase();
    const filterByStatus = statusFilter.toString().toLowerCase();
    const filterByVote = voteFilter.toString().toLowerCase();

    for (const item of json) {


        if (filterByText !== "") {
            const name = item["NAME"].toString().toLowerCase();
            const constituency = item["CONSTITUENCY"].toString().toLowerCase();

            const atLeastOneInclude = name.includes(filterByText) || constituency.includes(filterByText);
            if (!atLeastOneInclude) {
                continue;
            }
        }
        // filter by party
        if (filterByParty !== "any") {
            const party = item["PARTY"].toString().toLowerCase();
            if (!party.includes(filterByParty)) {
                continue;
            }
        }
        if (filterByStatus !== "any") {
            const status = item["Status"].toString().toLowerCase();
            if (!status.includes(filterByStatus)) {
                continue;
            }
        }
        const vote = item["vote"].toString()

        if (filterByVote !== "any") {
            let firstLetter = filterByVote.charAt(0);
            if (vote !== firstLetter) {
                continue
            }
        }

        const divElement = document.createElement("table");


        divElement.className = "single-mp"
        if (vote === "y") {
            divElement.className += " voted-yes"
        }
        if (vote === "a") {
            divElement.className += " voted-absent"
        }
        if (vote === "u") {
            divElement.className += " voted-unknown"
        }

        const header = divElement.insertRow();
        header.innerHTML = "<th style='white-space: nowrap'>Attribute</th><th>Value</th>"
        divElement.onclick = function () {
            moveMap(map, item, item["lat"], item["longitude"])
        }

        let voteExplanation = "";
        if (vote === "y") {
            voteExplanation = "Yes"
        } else if (vote === "n") {
            voteExplanation = "No"
        } else if (vote === "u") {
            voteExplanation = "Unknown"
        } else if (vote === "a") {
            voteExplanation = "Absent"
        }

        createSingleNode("Name", item["NAME"], divElement);
        createSingleNode("Constituency", item["CONSTITUENCY"], divElement);
        createSingleNode("Party", item["PARTY"], divElement);
        createSingleNode("Voted", voteExplanation, divElement);
        createSingleNode("Status", item["Status"], divElement);

        // createSinglePhoneNode("Phone Number", item["Phone number"], divElement);

        // <a href="https://www.flaticon.com/free-icons/pin-map" title="pin map icons">Pin map icons created by vinadbumi - Flaticon</a>
        if (item["relation_url"] !== null) {
            createSingleLinkNode("On Map", item["relation_url"], divElement);
        }


        const currentDiv = document.getElementById("container-anchor");
        currentDiv.parentNode.insertBefore(divElement, currentDiv.nextSibling);

    }
}

function fillMapWithPins(map, json) {

    const greenIcon = L.icon({
        iconUrl: '/img/location_green.png',
        shadowUrl: 'img/leaf-shadow.png',

        iconSize: [20, 20], // size of the icon
        shadowSize: [0, 0], // size of the shadow
        iconAnchor: [0, 0], // point of the icon which will correspond to marker's location
        shadowAnchor: [0, 0],  // the same for the shadow
        popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
    });
    const redIcon = L.icon({
        iconUrl: '/img/location_red.png',
        shadowUrl: '/img/leaf-shadow.png',

        iconSize: [20, 20], // size of the icon
        shadowSize: [0, 0], // size of the shadow
        iconAnchor: [0, 0], // point of the icon which will correspond to marker's location
        shadowAnchor: [0, 0],  // the same for the shadow
        popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
    });
    const yellowIcon = L.icon({
        iconUrl: '/img/location_yellow.png',
        shadowUrl: '/img/leaf-shadow.png',

        iconSize: [20, 20], // size of the icon
        shadowSize: [0, 0], // size of the shadow
        iconAnchor: [0, 0], // point of the icon which will correspond to marker's location
        shadowAnchor: [0, 0],  // the same for the shadow
        popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
    });
    const grayIcon = L.icon({
        iconUrl: '/img/location_yellow.png',
        shadowUrl: '/img/leaf-shadow.png',

        iconSize: [20, 20], // size of the icon
        shadowSize: [0, 0], // size of the shadow
        iconAnchor: [0, 0], // point of the icon which will correspond to marker's location
        shadowAnchor: [0, 0],  // the same for the shadow
        popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
    });
    for (const item of json) {
        const lat = item["lat"];
        const longitude = item["longitude"];
        // don't show those we don't have coordinates
        if (lat === 0.0 || longitude === 0.0) {
            continue;
        }
        // okay now add a map
        let icon = yellowIcon;
        const vote = item["vote"].toString()

        let voteDescription = "";
        if (vote === "y") {
            icon = redIcon;
            voteDescription = "yes";
        } else if (vote === "a") {
            icon = yellowIcon;
            voteDescription = "absent"
        } else if (vote === "n") {
            icon = greenIcon;
            voteDescription = "no"
        } else if (vote === "u") {
            icon = grayIcon;
            voteDescription = "unknown";
        }

        if (showMarkers) {
            L.marker([lat, longitude], {icon: icon}).addTo(map).bindPopup(`MP ${item["NAME"]}  of constituency ${item["CONSTITUENCY"]} voted ${voteDescription}`);

        }
    }
    showMarkers = false;

}

fetch("/js/consituency_relation.json").then((response => {
    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
}))
    .then((json) => {
        // create the map interface
        const map = createMap();
        {
            // map settings

            // pin mode
            let pinMode = document.getElementById("pin-mode")
            pinMode.onclick = function () {
                fillMapWithPins(map, json)
            }
            let recenter = document.getElementById("recenter-map")
            recenter.onclick = function () {
                map.flyTo([0.0236, 37.9062], 6.8)
            }
        }
        const politicalPartySelect = document.getElementById("political-party");
        const statusSelect = document.getElementById("status");
        const voteSelect = document.getElementById("voted");

        // search bar
        const searchInput = document.getElementById("search-input");

        let fnToCall = function () {
            createTable(map, json,
                {
                    text: searchInput.value,
                    politicalPartyFilter: politicalPartySelect.value,
                    statusFilter: statusSelect.value,
                    voteFilter: voteSelect.value
                });
        }

        politicalPartySelect.onchange = fnToCall;
        statusSelect.onchange = fnToCall;
        searchInput.oninput = fnToCall;
        voteSelect.onchange = fnToCall;
        // search filters
        fnToCall()

        // setup dialogs

        const infoIcon = document.getElementById("info-icon");
        const infoDialog = document.getElementById("information-dialog");
        const closeDialog = document.getElementById("close-info-dialog");

        infoIcon.onclick = function () {
            infoDialog.showModal();
        }
        closeDialog.onclick = function () {
            infoDialog.close();
        }
        const mapIcon = document.getElementById("map-icon");

        mapIcon.onclick = function () {
            let details = document.getElementById("details-container");
            let map = document.getElementById("map");

            if (details.style.display === "none") {
                details.style.display = "block";
                map.style.display = "none";
                mapIcon.style.color = "rgb(0,0,0,0.4)";

            } else {
                details.style.display = "none";
                map.style.display = "block";
                map.style.width = "100vw";
                mapIcon.style.color = "#04AA6D";

            }


        }


    });



