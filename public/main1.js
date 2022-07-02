let places = [];
let markers = [];
let infoWindows = [];
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
}
const placesObserver = function () {
  document.getElementById('place-list').innerHTML = '';
  infoWindows.forEach((infoWindow) => infoWindow.close());
  // https://timeapi.io/api/Time/current/zone?timeZone=america/chicago
  places.forEach((place, i) => {
    console.log(place);
    let lat = place.geometry.location.lat();
    let lng = place.geometry.location.lng();
    console.log(lat);
    //Add infowindow
    fetch(`http://localhost:8000/api?lat=${lat}&lng=${lng}`)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        let marker = new google.maps.Marker({
          position: place.geometry.location,
          map: map,
        });
        // Add marker to markers array
        markers.push(marker);
        console.log(data);
        // Create infoWindow for markers  //data.dateTime

        let infoWindow = new google.maps.InfoWindow({
          content: `${place.formatted_address} <h3>${getTime(
            data.dateTime
          )}</h3>`,
        });
        infoWindows.push(infoWindow);
        //Open Window
        console.log(data.dateTime);
        infoWindow.open({
          anchor: marker,
          map,
          shouldFocus: false,
        });
        //add address to ui list
        const node = document.createElement('div');
        const textnode = document.createTextNode(place.formatted_address);
        node.appendChild(textnode);
        document.getElementById('place-list').appendChild(node);

        if (i === places.length - 1) {
          let bounds = new google.maps.LatLngBounds();
          console.log(markers);
          for (let i = 0; i < markers.length; i++) {
            bounds.extend(markers[i].getPosition());
            console.log(markers);
          }
          map.fitBounds(bounds);
        }
      })
      .catch((error) => {
        console.log(
          'There has been a problem with your fetch operation:',
          error
        );
      });
  });
  // adjust zoom of map
};

function addPlace(place) {
  places.push(place);
  placesObserver();
}

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

function getTime(dateTime) {
  let now = new Date(dateTime);
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
