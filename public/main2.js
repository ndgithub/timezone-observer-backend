let places = [];
let sys = {};
let map;
let placeIdCounter = 0;
let host = '';

function initMap() {
  timeUpdater();
  initAutoComplete();

  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 30.2672, lng: -97.7431 },
    zoom: 2,
    mapType: 'satellite',
    disableDefaultUI: true,
  });

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

  let lat = place.geometry.location.lat();
  let lng = place.geometry.location.lng();

  fetch(`/api?lat=${lat}&lng=${lng}`)
    .then((response) => response.json())
    .then((data) => {
      place.utcOffset = data.dstOffset + data.rawOffset;
      place.sysOffset = place.utcOffset + sys.utcOffset;
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

function updateUiPlaces() {
  document.getElementById('place-list').innerHTML = '';

  places.forEach((place, i) => {
    const placeElem = document.createElement('div');
    placeElem.classList.add('place');
    placeElem.dataset.id = place.id;

    // placeElem.addEventListener('mouseover', () => {
    //   document.getElementsByClassName()
    // });

    const addressNode = document.createTextNode(place.formatted_address);
    const removeButton = document.createElement('button');
    removeButton.classList.add('remove-button');
    removeButton.appendChild(document.createTextNode('remove'));
    removeButton.addEventListener('click', (e) => {
      removePlace(placeElem.dataset.id);
    });
    placeElem.appendChild(addressNode);
    placeElem.appendChild(removeButton);
    document.getElementById('place-list').appendChild(placeElem);
  });

  let bounds = new google.maps.LatLngBounds();
  places.forEach((place) => {
    console.log(place);
    bounds.extend(place.geometry.location);
    map.fitBounds(bounds);
  });
  //map.fitBounds(bounds);
}

function removePlace(id) {
  console.log('remove-place');
  places.forEach((place, i) => {
    if (place.id === Number(id)) {
      places[i].infWin.close();
      places[i].marker.setVisible(false);
      places.splice(i, 1);
      //TODO:  close the infowindow and remove the marker first.
    }
  });
  console.log(places);
  updateUiPlaces();
}

function initAutoComplete() {
  const input = document.getElementById('pac-input');
  const options = {
    types: [
      'administrative_area_level_1',
      'administrative_area_level_2',
      'administrative_area_level_3',
      'country',
      'locality',
    ],
    fields: ['formatted_address', 'geometry', 'address_components'],
  };
  const autocomplete = new google.maps.places.Autocomplete(input, options);
  autocomplete.addListener('place_changed', function () {
    const place = autocomplete.getPlace();
    addPlace(place);
  });
}

function dayOfWk(dayNum) {
  switch (dayNum) {
    case 0:
      return 'Sunday';
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
      return 'Saturday';
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
  let day = dayOfWk(now.getDay());
  return `<div class="infowindow-day"><strong>${day} </div>
 <div class="infowindow-time"> ${hour}:${minute} ${amPm}<strong></div>`;
}
function getSysNow() {
  return Math.floor(Date.now() / 1000);
}
