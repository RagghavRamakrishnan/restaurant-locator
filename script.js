const restaurantImages = [
  'https://img.etimg.com/photo/96508902/96508902.jpg',
	'https://upload.wikimedia.org/wikipedia/commons/4/44/Cuisine_Trois_%C3%A9toiles.jpg',
	'https://sandinmysuitcase.com/wp-content/uploads/2020/04/Popular-Indian-Cuisine.jpg',
	'https://sukhis.com/app/uploads/2022/04/image3-4.jpg',
	'https://assets.telegraphindia.com/telegraph/2021/Jul/1625429173_indian-food.jpg',
	'https://www.rumispice.com/cdn/shop/articles/your-guide-to-the-history-taste-of-ethiopian-food-869598.jpg?v=1663735781',
	'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSUBpDRkfT-WiLCu-cDekrUAiAANxuxYEfcSg&usqp=CAU',
	'https://www.shutterstock.com/shutterstock/photos/1821694559/display_1500/stock-photo-uzbek-and-central-asia-cuisine-concept-assorted-uzbek-food-pilaf-samsa-lagman-manti-shurpa-uzbek-1821694559.jpg',
	'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ05onYoFsL9Mt8TLognWkPOue1eeTs8EqgKA&usqp=CAU',
	'https://cdn.britannica.com/05/232905-050-5BC905A7/Brazilian-cuisine-Shrimp-stew-usually-served-with-rice-mush-and-manioc-flour.jpg',
	'https://c.ndtvimg.com/2022-05/o7uik5o8_world-cuisine_625x300_10_May_22.jpeg?im=FaceCrop,algorithm=dnn,width=1200,height=675',
	'https://img.jakpost.net/c/2020/09/13/2020_09_13_104172_1599983230._large.jpg',
	'https://deih43ym53wif.cloudfront.net/idly-food-india-shutterstock_101041240_7bd8a6703f.jpeg',
	'https://chokhidhani.com/welcome-indore/wp-content/uploads/2022/12/5-1024x768.jpg',
	'https://images.livemint.com/rf/Image-920x613/LiveMint/Period2/2018/08/31/Photos/Processed/bhatkalcuisine-k62F--621x414@LiveMint.jpg',
  ];


let prevLocations = JSON.parse(localStorage.getItem('pastLocations')) || [];

function initMap(latitude, longitude) {
  const map = L.map('map').setView([latitude, longitude], 13);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  const bounds = L.latLngBounds();

  L.marker([latitude, longitude]).addTo(map).bindPopup('You are here').openPopup();
  bounds.extend([latitude, longitude]);

  for (const restaurant of restaurants) {
    if (restaurant.latitude && restaurant.longitude) {
      const restaurantLatitude = restaurant.latitude;
      const restaurantLongitude = restaurant.longitude;

      L.marker([restaurantLatitude, restaurantLongitude])
        .addTo(map)
        .bindPopup(restaurant.name);

      bounds.extend([restaurantLatitude, restaurantLongitude]);
    }
  }

  map.fitBounds(bounds);

  addMapMarkers(map);
}


function UserLocation() {
  if ('geolocation' in navigator) {
    navigator.geolocation.getCurrentPosition(getNearbyRestaurants, error => {
      console.error('Error getting user location:', error);
    });
  } else {
    console.error('Geolocation is not available on this device.');
  }
}


async function getRestaurants(latitude, longitude) {
  const url = `https://travel-advisor.p.rapidapi.com/restaurants/list-by-latlng?latitude=${latitude}&longitude=${longitude}&limit=30&currency=USD&distance=2&open_now=false&lunit=km&lang=en_US`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '4aa9213becmshcb7371b50012778p17d9a8jsnc30611bc33fe',
      'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    restaurants = data.data;
    showRestaurants(restaurants);
    storePastLocations(latitude, longitude); 
  } catch (error) {
    console.error('Error fetching restaurants:', error);
  }
}


function getRestaurantImage() {
  const randomIndex = Math.floor(Math.random() * restaurantImages.length);
  return restaurantImages[randomIndex];
}

async function getNearbyRestaurants(position) {
  const userLatitude = position.coords.latitude;
  const userLongitude = position.coords.longitude;

  const url = `https://travel-advisor.p.rapidapi.com/restaurants/list-by-latlng?latitude=${userLatitude}&longitude=${userLongitude}&limit=30&currency=USD&distance=2&open_now=false&lunit=km&lang=en_US`;
  const options = {
    method: 'GET',
    headers: {
      'X-RapidAPI-Key': '4aa9213becmshcb7371b50012778p17d9a8jsnc30611bc33fe',
      'X-RapidAPI-Host': 'travel-advisor.p.rapidapi.com'
    }
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    restaurants = data.data;

    showRestaurants(restaurants);
    storePastLocations(userLatitude, userLongitude); 
    initMap(userLatitude, userLongitude); 
  } catch (error) {
    console.error('Error fetching restaurants:', error);
  }
}



function showRestaurants(restaurantsData) {
  const restaurantInfoDiv = document.getElementById('restaurant-info');
  restaurantInfoDiv.innerHTML = '';

  for (const restaurant of restaurantsData) {
    const restaurantCard = document.createElement('div');
    restaurantCard.classList.add('restaurant-card');

    const restaurantImg = document.createElement('img');
    restaurantImg.src = restaurant.photo?.images?.small?.url || getRestaurantImage();
    restaurantImg.alt = restaurant.name;

    const restaurantCardContent = document.createElement('div');
    restaurantCardContent.classList.add('restaurant-card-content');

    const restaurantName = document.createElement('h3');
    restaurantName.textContent = restaurant.name;

    const restaurantRating = document.createElement('p');
    restaurantRating.textContent = `Rating: ${restaurant.rating}`;

    restaurantCardContent.appendChild(restaurantName);
    restaurantCardContent.appendChild(restaurantRating);

    restaurantCard.appendChild(restaurantImg);
    restaurantCard.appendChild(restaurantCardContent);

    restaurantInfoDiv.appendChild(restaurantCard);
  }
}


function addMapMarkers(map) {
  map.on('click', async function (event) {
    const latitude = event.latlng.lat;
    const longitude = event.latlng.lng;

    await getRestaurants(latitude, longitude);

    map.eachLayer(function (layer) {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    RestaurantPoints(map, restaurants);
  });
}


function RestaurantPoints(map, restaurantsData) {
  for (const restaurant of restaurantsData) {
    if (restaurant.latitude && restaurant.longitude) {
      const restaurantLatitude = restaurant.latitude;
      const restaurantLongitude = restaurant.longitude;

      L.marker([restaurantLatitude, restaurantLongitude])
        .addTo(map)
        .bindPopup(restaurant.name);
    }
  }
}

async function storePastLocations(latitude, longitude) {
  const address = await getAddressFromCoordinates(latitude, longitude);
  prevLocations.push(address);
  localStorage.setItem('pastLocations', JSON.stringify(prevLocations));
  showPrevLocations();
}

async function getAddressFromCoordinates(latitude, longitude) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;
  const options = {
    method: 'GET',
    headers: {
      'User-Agent': 'Mozilla/5.0' 
    }
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    const address = data.display_name;
    return address;
  } catch (error) {
    console.error('Error fetching address:', error);
    return '';
  }
}



function showPrevLocations() {
  const pastLocationsList = document.getElementById('past-locations-list');
  pastLocationsList.innerHTML = '';

  if (prevLocations.length === 0) {
    const noLocationItem = document.createElement('li');
    noLocationItem.textContent = 'No past locations available.';
    pastLocationsList.appendChild(noLocationItem);
    return;
  }

  const startIndex = Math.max(0, prevLocations.length - 10); 

  for (let i = startIndex; i < prevLocations.length; i++) {
    const location = prevLocations[i];
    const locationItem = document.createElement('li');
    locationItem.textContent = `${location}`;
    pastLocationsList.appendChild(locationItem);
  }
}


UserLocation();
