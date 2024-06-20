var map = L.map('map').setView([0.0236, 37.9062], 6.4);
map.createPane('labels');
map.getPane('labels').style.pointerEvents = 'none';
map.getPane('labels').style.zIndex = 650;

var positron = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png', {
  attribution: '©OpenStreetMap, ©CartoDB'
}).addTo(map);

var positronLabels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}.png', {
  attribution: '©OpenStreetMap, ©CartoDB',
  pane: 'labels'
}).addTo(map);


function createTable(json, text) {
  for (var item of json) {
    var t = text.toString().toLowerCase()
    if (t !== "") {

    } else {
      // we should filter
      var name = item["NAME"].toString().toLowerCase();
      if (!name.includes(t)) {
        continue;
      }
    }
    const divElement = document.createElement("table");
    divElement.className = "single-mp"
    // and give it some content

    const header = divElement.insertRow();
    header.innerHTML = "<th>Attribute</th><th>Value</th>"


    createSingleNode("Name", item["NAME"], divElement);
    createSingleNode("Constituency", item["CONSTITUENCY"], divElement);
    createSingleNode("Party", item["PARTY"], divElement);
    createSinglePhoneNode("Phone Number", item["Phone number"], divElement);
    createSingleLinkNode("OSM", item["relation_url"], divElement);
    createMapNode(item, item["lat"], item["longitude"], divElement);

    const currentDiv = document.getElementById("container-anchor");
    currentDiv.parentNode.insertBefore(divElement, currentDiv.nextSibling);

  }
}

fetch("/js/consituency_relation.json").then((response => {
  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }
  return response.json();
})).then((json) => {


  const currentDiv = document.getElementById("search-input");

  currentDiv.addEventListener("change",function () {
    createTable(json, currentDiv.value);

  })
  createTable(json, "");
});

function createSingleNode(key, value, tableElement) {
  const tr = tableElement.insertRow();
  const td1 = tr.insertCell();
  td1.innerText = key;
  const td2 = tr.insertCell();
  td2.innerText = value;
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
  td1.innerText = key;
  const td2 = tr.insertCell();
  if (value == null) {
    td2.innerText = "UNKNOWN";
  } else {
    td2.innerHTML = "<a  target='_blank' href=" + value + ">" + value + "<a/>";
  }
}

function createMapNode(item, lat, long, tableElement) {
  const tr = tableElement.insertRow();
  const td1 = tr.insertCell();
  td1.innerText = "Map Coordinates";
  const td2 = tr.insertCell();
  td2.innerText = `(${lat} ${long})`
  td2.onclick = function () {
    if (lat !== 0 && long !== 0) {
      map.setZoom(9)
      map.panTo([lat, long])

      // map.zoomIn(1)
      L.popup()
        .setLatLng([lat, long])
        .setContent(`Constituency: ${item['CONSTITUENCY']}\nMP: ${item['NAME']}`)
        .openOn(map);

    }
  }

}

// map.fitBounds(bounds)


