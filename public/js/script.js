const socket = io();

// Object to store markers for each user
const markers = {};
let userMarker; // Store the user's own marker
let userId = null; // Track user's socket ID for map centering

if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            
            // Send user's current location to the server
            socket.emit("send-location", { latitude, longitude });

            // If user's marker is not yet added, create and center the map on user's position
            if (!userMarker) {
                userMarker = L.marker([latitude, longitude]).addTo(map).bindPopup("You are here").openPopup();
                map.setView([latitude, longitude], 16); // Set the initial view to user's location
            } else {
                // Update the user's own marker position on subsequent location updates
                userMarker.setLatLng([latitude, longitude]);
            }
        },
        (error) => {
            console.error("Geolocation error:", error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        }
    );
}

// Create the map object
const map = L.map("map").setView([20, 77], 5); // Default center on India until location is retrieved

// Add OpenStreetMap tiles to the map
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

// Listen for location updates from other users on the server
socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;

    // Assign the userId to the current socket ID if not set (first time connection)
    if (!userId) {
        userId = id;
    }

    // Check if a marker for this user exists, and update its position
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
    } else {
        // Add a new marker for this user if it doesn't exist yet
        markers[id] = L.marker([latitude, longitude]).addTo(map).bindPopup(`User: ${id}`);
    }
});

// Listen for when a user disconnects and remove their marker
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]);  // Remove the marker from the map
        delete markers[id];  // Remove the marker from the markers object
    }
});
