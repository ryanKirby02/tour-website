export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoicnlhbmtpcmJ5MDIiLCJhIjoiY2t1YTBnMHEzMGNicTMxbno0MGx3eWg3aCJ9.PNmOCXRNPqwpImD-UwKUJg';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/ryankirby02/ckua0wiwh63vw17qoahtf98uh',
    scrollZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((location) => {
    const element = document.createElement('div');
    element.className = 'marker';

    new mapboxgl.Marker({
      element: element,
      anchor: 'bottom',
    })
      .setLngLat(location.coordinates)
      .addTo(map);

    new mapboxgl.Popup({
      offset: 35,
    })
      .setLngLat(location.coordinates)
      .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
      .addTo(map);

    bounds.extend(location.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
