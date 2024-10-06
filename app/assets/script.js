"use strict";

// program data
let myApp = {
    'user_id': null,
    'lat': null,
    'lon': null,
    'products': []
}

// login component

function loginComponent() {
    let root = document.createElement("div");

    root.innerHTML = `
<form action="javascript:void(0);" id="loginForm">
    <label for="phone">Phone number:</label><br>
    <input type="text" id="phone" name="phone" placeholder="+1 (742) 893 1956"><br>
    <label for="email">Email:</label><br>
    <input type="text" id="email" name="email" placeholder="abra@radab.ca"><br><br>
    <input type="checkbox" id="newsletter" name="newsletter" />
    <label for="newsletter">Sign up for newsletter</label>
    <br />
    <input type="submit" id="startAppButton" value="Start App">
</form>
`;
    document.querySelector("body").appendChild(root)

    let b = document.getElementById("startAppButton");
    b.classList.add("startAppButton");

    document.querySelector("#loginForm").onsubmit = (event) => {
        //console.log("Sumbit form!");
        //console.log(event);
        let formData = new FormData(event.target);
        // output as an object
        let data = Object.fromEntries(formData);

        // if (!data['title'] || !data['price']) {
        //     alert("Please set title and price");
        //     return;
        // }

        fetch("/login", {
            method: "POST",
            body: JSON.stringify(data)
        })
            .then((response) => response.json())
            .then((response) =>
                new Promise((ok, fail) => {
                    if (response['status'] == 'ok') {
                        myApp['user_id'] = response['user_id'];
                        root.remove();
                        geoFindMe();
                        landingPage();
                        // ... do stuff
                        ok();
                    } else {
                        fail();
                    }
                }))
    }
}

loginComponent();

// gps

// https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates
function getDistanceFromLatLonInM(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1);
  var a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ;
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c; // Distance in km
  return d * 1000;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}

function geoFindMe() {
    const trackPeriod = 1000; // ms

    const status = document.querySelector("#status");
    const mapLink = document.querySelector("#map-link");

    mapLink.href = "";
    mapLink.textContent = "";

    if (!navigator.geolocation) {
        status.textContent = "Geolocation is not supported by your browser";
    } else {
        status.textContent = "Locating…";
        navigator.geolocation.watchPosition(
            function (position) {
                const latitude = position.coords.latitude;
                const longitude = position.coords.longitude;

                myApp['lat'] = latitude;
                myApp['lon'] = longitude;

                fetch("/gpsLogger", {
                    method: "POST",
                    body: JSON.stringify({"latitude": latitude, "longitude": longitude})
                });

                status.textContent = "";
                mapLink.href = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`;
                mapLink.textContent = `Latitude: ${latitude} °, Longitude: ${longitude} °`;
                mapLink.classList.add("locationIndicator")

                updateProductsComponent();
            },
            function (error) {
                /*alert(`ERROR: ${error.message}`);*/
            },
            {
                enableHighAccuracy: true,
            }
        );
    }
}

// landingPage
// only updates local stuff, i.e. recomputes distances and sorts
function updateProductsComponent() {
    let products = myApp["products"];
    let elId = "productsComponent";

    let oldProductsComponent = document.getElementById(elId);
    if (oldProductsComponent)
        oldProductsComponent.remove();

    let productsComponent = document.createElement("div");
    productsComponent.id = elId;
    document.querySelector("body").appendChild(productsComponent);

    // add distance info and sort by distance
    for (let item of products) {
        let distance = getDistanceFromLatLonInM(
            myApp['lat'], myApp['lon'],
            item.lat, item.lon);
        distance = Math.floor(distance * 100) / 100;

        item['distance'] = distance;
    }

    products.sort((a, b) => a.distance - b.distance);

    let itemTag;
    for (let item of products) {
        //console.log(itemData);
        itemTag = document.createElement("div");
        itemTag.innerHTML = `
<h2>${item.title} - ${item.price}</h2>
<div>Location: ${item.lat}, ${item.lon}</div>
<div>Distance: ${item.distance} m </div>
<button class="buttonBuy">Buy Now</button>
`;
        productsComponent.appendChild(itemTag);
    };
}

function landingPage() {
    let b = document.createElement("button");
    b.innerHTML = "Sell Stuff";
    document.querySelector("body").appendChild(b)
    b.classList.add("buttonSell")
    b.onclick = sellStuffForm;

    // items
    // let itemData = [
    //     {
    //         "title": "Used bicycle",
    //         "lat": 49.262098693847655,
    //         "lon": -123.24851837158204,
    //         "price": "$5/hour"
    //     },
    //     {
    //         "title": "Washing machine rent",
    //         "lat": 49.262098693847655,
    //         "lon": -123.24851837158204,
    //         "price": "$1/hour"
    //     },
    //     {
    //         "title": "Soup",
    //         "lat": 49.262098693847655,
    //         "lon": -123.24851837158204,
    //         "price": "$8"
    //     },
    // ]

    pullProducts();
}

function pullProducts() {
    fetch("/product")
        .then((response) => response.json())
        .then((products) => {myApp['products'] = products;})
        .then(updateProductsComponent);
}

// refresh products every two seconds
setInterval(() => {
    // only pull when logged in
    if (!myApp["user_id"])
        return;

    pullProducts();
}, 2000);

function sellStuffForm() {
    // one modal max
    if (!!document.querySelector(".modal"))
        return;

    let modal = document.createElement("div");
    modal.classList.add("modal");
    document.querySelector("body").appendChild(modal);

    let modal_bg = document.createElement("div");
    modal_bg.classList.add("modalBg");
    document.querySelector("body").appendChild(modal_bg);

    // fill modal
    modal.innerHTML = `
<div class="verticalAlign">
<div class="modalContent">
<div class="modelPanel">
  <form action="javascript:void(0);" id="productSubmitForm">
    <label for="title">Title:</label><br>
    <input type="text" id="title" name="title" placeholder="Soup"><br>
    <label for="price">Price:</label><br>
    <input type="text" id="price" name="price" placeholder="$8/L"><br><br>
    <input type="submit" value="Submit">
    <button id="productSubmitFormCancel">Cancel</button>
  </form>
</div>
</div>
</div>`;

    function closeForm() {
        modal.remove();
        modal_bg.remove();
    }

    document.querySelector("#productSubmitFormCancel").onclick = closeForm;

    document.querySelector("#productSubmitForm").onsubmit = (event) => {
        //console.log("Sumbit form!");
        //console.log(event);
        let formData = new FormData(event.target);
        // output as an object
        let data = Object.fromEntries(formData);

        if (!data['title'] || !data['price']) {
            alert("Please set title and price");
            return;
        }

        data['user_id'] = myApp['user_id'];
        data['lat'] = myApp['lat'];
        data['lon'] = myApp['lon'];

        fetch("/product", {
            method: "POST",
            body: JSON.stringify(data)
        })
            .then((response) => response.json())
            .then((response) =>
                new Promise((ok, fail) => {
                    if (response['status'] == 'ok') {
                        myApp["products"] = response['products'];
                        updateProductsComponent();
                        ok();
                    } else {
                        fail();
                    }
                }))
            .then(closeForm);
    }
}
