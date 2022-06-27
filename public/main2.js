let places = [];
let sys = {};
let map;
function initMap() {
  console.log('asdf');

  initAutoComplete();
  document
    .getElementById('refresh-button')
    .addEventListener('click', () => placesObserver());
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

function addPlace(place) {
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
      places.push(place);
      updateTimes();
    })
    .catch((error) => {
      console.log('There has been a problem with your fetch operation:', error);
    });
}

function updateUiPlaces() {}
function updateTimes() {
  places.forEach((place) => {
    place.infoWindow.setContent();
  });
}
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
  console.log(dateTime);
  let now = new Date(dateTime * 1000);
  let isAm = now.getHours() < 12 ? true : false;
  let hour = isAm ? now.getHours() : now.getHours() - 12;
  let minute =
    now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes();
  let seconds =
    now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds();
  let amPm = isAm ? 'AM' : 'PM';
  let day = dayOfWk(now.getDay());
  return `${day} <br>
  ${hour}:${minute}:${seconds} ${amPm}`;
}
function getSysNow() {
  return Math.floor(Date.now() / 1000);
}
