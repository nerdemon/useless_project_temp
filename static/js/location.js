async function getWeatherByCity() {
    const city = document.getElementById("cityInput").value.trim();
    if (!city) {
        alert("Please enter a city name");
        return;
    }
    fetchWeather(`/weather?city=${encodeURIComponent(city)}`);
}

function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeather(`/weather?lat=${lat}&lon=${lon}`);
        }, () => {
            alert("Unable to get your location.");
        });
    } else {
        alert("Geolocation not supported by this browser.");
    }
}

async function fetchWeather(url) {
    const res = await fetch(url);
    const data = await res.json();

    if (data.error) {
        document.getElementById("weatherResult").innerHTML = `<p style="color:red;">${data.error}</p>`;
        return;
    }

    document.getElementById("weatherResult").innerHTML = `
        <h2>${data.city}</h2>
        <p>🌡 Temperature: ${data.temperature}°C</p>
        <p>💨 Wind Speed: ${data.wind_speed} m/s</p>
        <p>🌧 Rain (last 1h): ${data.rain || "0"} mm</p>
        <p>${data.status}</p>
    `;

    if (data.alert) {
        document.getElementById("alertSound").play();
    }
}
