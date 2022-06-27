let places = [];
let sys = {};
let map;
let placeIdCounter = 0;

function initMap() {
  console.log('asdf');
  timeUpdater();
  initAutoComplete();
  document
    .getElementById('refresh-button')
    .addEventListener('click', () => updateTimes());

  map = new google.maps.Map(document.getElementById('map'), {
    center: { lat: 30.2672, lng: -97.7431 },
    zoom: 4,
    mapType: 'satellite',
    disableDefaultUI: false,
  });

  sys.utcOffset = new Date().getTimezoneOffset() * 60;
  sys.tzName = Intl.DateTimeFormat().resolvedOptions().timeZone;
  console.log(`System time is ${getSysNow()} secs since epoch,
  Timezone is ${sys.tzName}`);
  console.log(sys);
  // TODO: Get current time and timezone of user
  // for each each added place, including (my default), just get timezone and calculate offset
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

  // https://sleepy-taiga-55992.herokuapp.com

  fetch(`http://localhost:8000/api?lat=${lat}&lng=${lng}`)
    .then((response) => response.json())
    .then((data) => {
      place.utcOffset = data.dstOffset + data.rawOffset;
      place.sysOffset = place.utcOffset + sys.utcOffset;
      place.marker = new google.maps.Marker({
        position: place.geometry.location,
        map: map,
        visible: true,
        label: 'aasdf',
      });
      let infWin = new google.maps.InfoWindow({});
      place.infWin = infWin;
      place.infWin.setContent(formatTime(getSysNow() + place.sysOffset));
      place.infWin.open({
        anchor: place.marker,
        map,
        shouldFocus: false,
      });

      console.log(places);
      addUiPlace(place);
      places.push(place);
    })
    .catch((error) => {
      console.log('There has been a problem with your fetch operation:', error);
    });
}

function removePlace(id) {
  places.splice(1, 1);
  console.log('remove-place');
  places.forEach((place, i) => {
    console.log(place.id);
    console.log(id);
    if (place.id === Number(id)) {
      console.log('matches id');
      places[i].infWin.close();
      places[i].marker.setVisible(false);
      places.splice(i, 1);

      //TODO:  close the infowindow and remove the marker first.
    }
  });
  console.log(places);
  updateUiPlaces();
}

function updateUiPlaces() {
  document.getElementById('place-list').innerHTML = '';

  places.forEach((place, i) => {
    const placeElem = document.createElement('div');
    placeElem.dataset.id = place.id;
    const textnode = document.createTextNode(place.formatted_address);

    const removeButton = document.createElement('button');
    removeButton.appendChild(document.createTextNode('remove'));
    removeButton.addEventListener('click', (e) => {
      removePlace(placeElem.dataset.id);
    });
    placeElem.appendChild(textnode);
    placeElem.appendChild(removeButton);
    document.getElementById('place-list').appendChild(placeElem);
  });
}

function addUiPlace(place) {
  //add address to ui list
  const placeElem = document.createElement('div');
  placeElem.dataset.id = place.id;
  const textnode = document.createTextNode(place.formatted_address);

  const removeButton = document.createElement('button');
  removeButton.appendChild(document.createTextNode('remove'));
  removeButton.addEventListener('click', (e) => {
    removePlace(placeElem.dataset.id);
  });
  placeElem.appendChild(textnode);
  placeElem.appendChild(removeButton);
  document.getElementById('place-list').appendChild(placeElem);
}
function updateTimes() {}
// Updates the time of placeObject
function setTimes() {}
function initAutoComplete() {
  const input = document.getElementById('pac-input');
  const options = {
    fields: ['formatted_address', 'geometry'],
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
  return `<div><strong>${day} <br>
  ${hour}:${minute}:${seconds} ${amPm}<strong></div>`;
}
function getSysNow() {
  return Math.floor(Date.now() / 1000);
}
