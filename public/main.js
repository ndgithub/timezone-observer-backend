let places = [];
let sys = {};
let map;
let placeIdCounter = 0;
let host = '';

function initMap() {
  timeUpdater();
  initAutoComplete();
  UTILS.log('asdfsdfsdf');
  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 30.2672, lng: -97.7431 },
    zoom: 2,
    disableDefaultUI: false,
    mapTypeId: 'satellite',
    mapTypeControlOptions: {
      style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
      position: google.maps.ControlPosition.BOTTOM_CENTER,
    },
    streetViewControl: false,
    //mapId: '353cc19a9b814971',
  });

  // const countryLayer = map.getFeatureLayer(google.maps.FeatureType.COUNTRY);
  // countryLayer.style = {
  //   strokeColor: 'blue',
  //   strokeWeight: 1,
  // };
  sys.utcOffset = new Date().getTimezoneOffset() * 60;
  sys.tzName = Intl.DateTimeFormat().resolvedOptions().timeZone;
  console.log(`System time is ${getSysNow()} secs since epoch,
  Timezone is ${sys.tzName}`);
}

function timeUpdater() {
  setInterval(() => {
    places.forEach((place) => {
      place.infWin.setContent(formatTime(getSysNow() + place.sysOffset));
    });
  }, 1000);
}

function addPlace(place) {
  place.id = placeIdCounter;
  placeIdCounter++;
  formatAddress(place);
  fetch(
    `/api?lat=${place.geometry.location.lat()}&lng=${place.geometry.location.lng()}`
  )
    .then((response) => response.json())
    .then((data) => {
      place.utcOffset = data.dstOffset + data.rawOffset;
      place.sysOffset = place.utcOffset + sys.utcOffset;
      place.timeZoneName = data.timeZoneName;
      place.marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        visible: false,
      });
      let infWin = new google.maps.InfoWindow({});
      place.infWin = infWin;
      place.infWin.setContent(formatTime(getSysNow() + place.sysOffset));
      place.infWin.open({
        anchor: place.marker,
        map,
        shouldFocus: false,
      });

      places.push(place);
      places.sort((a, b) => {
        if (a.utcOffset > b.utcOffset) return 1;
        return -1;
      });
      updateUiPlaces();
    })
    .catch((error) => {
      console.log('There has been a problem with your fetch operation:', error);
    });
}

function formatAddress(place) {
  place.address_components.forEach((comp) => {
    switch (comp.types[0]) {
      case 'locality':
        place.locality = comp.long_name;
        break;
      case 'administrative_area_level_1':
        place.admin =
          comp.long_name.length > 5 ? comp.short_name : comp.long_name;
        place.admin = place.admin + ',';
        break;
      case 'country':
        place.country =
          comp.long_name.length > 6 ? comp.short_name : comp.long_name;
        break;
      default:
      // code block
    }
  });
}

function updateUiPlaces() {
  document.getElementById('place-list').innerHTML = '';

  places.forEach((place, i) => {
    if (place.timeZoneName !== place.timeZoneName[i - 1]) {
      console.log(place.timeZoneName);
    }

    const placeElem = document.createElement('div');
    placeElem.classList.add('place');
    placeElem.dataset.id = place.id;

    const addressDiv = document.createElement('div');

    const time = document.createElement('div');
    const locality = document.createElement('div');
    const admin = document.createElement('div');
    const country = document.createElement('div');
    const marker = document.createElement('div');
    // marker.innerHTML = `<i class="ri-map-pin-time-fill"></i>`;

    addressDiv.classList.add('address');

    time.classList.add('locality', 'time-component');
    locality.classList.add('locality', 'address-component');
    admin.classList.add('admin', 'address-component');
    country.classList.add('country', 'address-component');
    marker.classList.add('marker', 'address-component');

    const timeText = document.createTextNode(
      formatTimeText(getSysNow() + place.sysOffset)
    );
    const localityText = document.createTextNode(place.locality);
    const adminText = document.createTextNode(place.admin);
    const countryText = document.createTextNode(place.country);

    time.appendChild(timeText);
    locality.appendChild(localityText);
    admin.appendChild(adminText);
    country.appendChild(countryText);

    let components = [time, marker, locality, admin, country];
    components.forEach((component) => {
      if (component.innerHTML !== 'undefined') {
        addressDiv.appendChild(component);
      }
    });

    // Create Remove Button
    const removeButton = document.createElement('button');
    removeButton.classList.add('remove-button');
    removeButton.appendChild(document.createTextNode('remove'));
    removeButton.addEventListener('click', (e) => {
      removePlace(placeElem.dataset.id);
    });

    placeElem.appendChild(addressDiv);
    placeElem.appendChild(removeButton);

    document.getElementById('place-list').appendChild(placeElem);
  });

  let bounds = new google.maps.LatLngBounds();
  places.forEach((place) => {
    bounds.extend(place.geometry.location);
    map.fitBounds(bounds);
  });
}

function removePlace(id) {
  places.forEach((place, i) => {
    if (place.id === Number(id)) {
      places[i].infWin.close();
      places[i].marker.setVisible(false);
      places.splice(i, 1);
    }
  });
  updateUiPlaces();
}

function initAutoComplete() {
  const input = document.getElementById('pac-input');
  const options = {
    types: [
      // 'administrative_area_level_1',
      // 'administrative_area_level_2',
      // 'country',
      'locality',
    ],
    fields: ['formatted_address', 'geometry', 'address_components'],
  };
  const autocomplete = new google.maps.places.Autocomplete(input, options);
  autocomplete.addListener('place_changed', function () {
    const place = autocomplete.getPlace();
    addPlace(place);
    document.getElementById('pac-input').value = '';
  });
}

function dayOfWk(dayNum, dayType) {
  switch (dayNum) {
    case 0:
      return dayType == 'long' ? 'Sunday' : 'SUN';
      break;
    case 1:
      return 'Monday';
      break;
    case 2:
      return 'Tuesday';
      break;
    case 3:
      return 'Wednesday';
      break;
    case 4:
      return 'Thursday';
      break;
    case 5:
      return 'Friday';
      break;
    case 6:
      return dayType == 'short' ? 'SAT' : 'Saturday';
      break;
  }
}

function formatTime(dateTime) {
  let now = new Date(dateTime * 1000);
  let isAm = now.getHours() < 12 ? true : false;
  let hour = isAm ? now.getHours() : now.getHours() - 12;
  let minute =
    now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
  let seconds =
    now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds();
  let amPm = isAm ? 'AM' : 'PM';
  let day = dayOfWk(now.getDay(), 'long');
  return `<div class="infowindow-day"><strong>${day} </div>
 <div class="infowindow-time"> ${hour}:${minute} ${amPm}<strong></div>`;
}

function formatTimeText(dateTime) {
  let now = new Date(dateTime * 1000);
  let isAm = now.getHours() < 12 ? true : false;
  let hour = isAm ? now.getHours() : now.getHours() - 12;
  let minute =
    now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
  let seconds =
    now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds();
  let amPm = isAm ? 'AM' : 'PM';
  let day = dayOfWk(now.getDay(), 'short');
  return `${day} ${hour}:${minute} ${amPm}`;
}

function getSysNow() {
  return Math.floor(Date.now() / 1000);
}
