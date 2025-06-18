/* eslint-disable */

export const displayMap = locations => {
  mapboxgl.accessToken = 'pk.eyJ1IjoibWluYXpkZXYiLCJhIjoiY2x3YjQ2eGlrMHh1bjJrbG82Z2d2N284diJ9.7196_WlqX3eYh14-g0tC3w'; // Replace with your actual Mapbox access token from .env
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/minazdev/clwb484q9001v01qzc2s45271', // Replace with your actual Mapbox style URL
    scrollZoom: false
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // Add marker
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // Add popup
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    // Extend map bounds to include current location
    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });
};