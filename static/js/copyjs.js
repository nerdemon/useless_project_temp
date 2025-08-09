async function getWeatherByCity() {
    const city = document.getElementById("cityInput").value;
    if (!city) return alert("Please enter a city");

    const res = await fetch(`/weather?city=${city}`);
    const data = await res.json();
    displayWeather(data);
}

async function getWeatherByLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const res = await fetch("/weather", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    lat: pos.coords.latitude,
                    lon: pos.coords.longitude
                })
            });
            const data = await res.json();
            displayWeather(data);
        });
    } else {
        alert("Geolocation is not supported by your browser");
    }
}

function displayWeather(data) {
    if (data.error) {
        document.getElementById("weatherResult").innerHTML = `<p>${data.error}</p>`;
        return;
    }

    document.getElementById("weatherResult").innerHTML = `
        <h2>${data.city}</h2>
        <p>${data.description}</p>
        <p>🌡 Temp: ${data.temperature}°C</p>
        <p>☔ Rain: ${data.rain_mm} mm</p>
        <p>💨 Wind: ${data.wind_speed} m/s</p>
        <h3>${data.alert}</h3>
    `;

    if (data.alert.includes("⚠️") || data.alert.includes("☔")) {
        document.getElementById("alertSound").play();
    }
}
