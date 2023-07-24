'use strict';
// 228-243

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

class Workout {
  date = new Date().toDateString();
  id = Date.now();

  constructor(distance, duration, coords) {
    this.coords = coords; //[lat, lng]
    this.distance = distance; // in km
    this.duration = duration; // in min
  }
}

class Running extends Workout {
  type = 'running';

  constructor(coords, distance, duration, cadence) {
    super(distance, duration, coords);
    this.cadence = cadence;
    this.calcPace();
  }

  calcPace() {
    //min/km
    this.pace = this.duration / this.distance;
    this.pace;
  }
}

class Cycling extends Workout {
  type = 'cycling';

  constructor(coords, distance, duration, elevationGain) {
    super(distance, duration, coords);
    this.elevationGain = elevationGain;
    this.calcSpeed();
  }

  calcSpeed() {
    //km/h
    this.speed = this.distance / this.duration / 60;
    this.speed;
  }
}

// const running1 = new Running([39, -12], 5.2, 23, 178);
// const cycling1 = new Cycling([39, -12], 27, 95, 523);
// console.log(running1, cycling1);

// APPLICATION ARCHITECTURE

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert('Could not get your current position');
        }
      );
  }

  _loadMap(position) {
    const { latitude, longitude } = position.coords;

    const coords = [latitude, longitude];

    this.#map = L.map('map').setView(coords, 13);

    L.tileLayer('http://{s}.google.com/vt?lyrs=m&x={x}&y={y}&z={z}', {
      maxZoom: 20,
      subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // Current location marker
    L.marker(coords).addTo(this.#map).bindPopup('Current location').openPopup();

    // Handling click on map
    this.#map.on('click', this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove('hidden');
    inputDistance.focus();
  }

  _toggleElevationField() {
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
  }

  _newWorkout(e) {
    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();

    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    // If activity running. create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;

      // Check if data is valid
      if (
        !validInputs(cadence, duration, distance) ||
        !allPositive(cadence, duration, distance)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // If activity cycling. create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      // Check if data is valid
      if (
        !validInputs(elevation, duration, distance) ||
        !allPositive(duration, distance)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    // Add new object to workout array
    this.#workouts.push(workout);
    // console.log(this.#workouts);

    // Render workout on map as marker
    this.renderWorkoutMarker(workout);
    // Render workout on list
    // Hide form + Clear input fields

    // Clear input fields
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        '';
  }

  renderWorkoutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(`Distance: ${workout.distance.toString()} km`)
      .openPopup();
  }
}

const app = new App();

