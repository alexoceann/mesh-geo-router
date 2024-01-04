<script lang="ts">
let status = "Locating…";
let latitude: number, longitude: number;
$: mapLink = `https://www.openstreetmap.org/#map=18/${latitude}/${longitude}`

$: {
  if (!navigator.geolocation) {
    status = "Geolocation is not supported by your browser";
  }
}

function geoFindMe() {
    navigator.geolocation.getCurrentPosition(
    (position) => {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;

        status = "";
        },
    () => {
        status = "Unable to retrieve your location";
        }
    );
}
</script>

<button on:click={geoFindMe}>
    Show my location
</button>

<p>{status}</p>
<a href={mapLink}>Latitude: {latitude} °, Longitude: {longitude} °</a>
