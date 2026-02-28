async function getWeatherByCity() {
    const city = document.getElementById("cityInput").value.trim();
    if (!city) {
        alert("Please enter a city name first! 🌴");
        return;
    }
    fetchWeather(`/weather?city=${encodeURIComponent(city)}`);
}

function getWeatherByLocation() {
    if (navigator.geolocation) {
        // Show loading state
        document.getElementById("cityInput").value = "Locating...";
        
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeather(`/weather`, { lat, lon });
            document.getElementById("cityInput").value = "";
        }, () => {
            alert("Unable to get your location. Please type your city.");
            document.getElementById("cityInput").value = "";
        });
    } else {
        alert("Geolocation not supported by this browser.");
    }
}

async function fetchWeather(url, bodyData = null) {
    const options = bodyData ? {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData)
    } : {};

    try {
        const res = await fetch(url, options);
        const data = await res.json();
        
        const resultBox = document.getElementById("weatherResult");
        resultBox.style.display = "block"; // Unhide the box

        if (data.error) {
            resultBox.innerHTML = `<h3 style="color:red;">${data.error}</h3>`;
            return;
        }

        // Check if the threat level is safe or dangerous to style the alert box
        const alertClass = data.threat_level === "🟢 SAFE" ? "safe-text" : "alert-text";

        resultBox.innerHTML = `
            <h2 style="margin: 0; color: #2c3e50;">${data.city}</h2>
            <p style="margin: 5px 0; color: #7f8c8d; text-transform: capitalize;">${data.description}</p>
            
            <div class="weather-stats">
                <div>🌡 <strong>${data.temperature}°C</strong></div>
                <div>💨 <strong>${data.wind_speed} m/s</strong></div>
                <div>🌧 <strong>${data.rain_mm} mm</strong></div>
            </div>

            <p style="font-weight: bold;">Fruit Threat Level: ${data.threat_level}</p>
            
            <div class="${alertClass}">
                ${data.alert}
            </div>
        `;

        // Trigger audio if the backend says play_sound is True
        if (data.play_sound) {
            const audio = document.getElementById("alertSound");
            audio.currentTime = 0; // Rewind to start
            audio.play().catch(e => console.log("Browser blocked autoplay. User must interact first."));
        }

    } catch (error) {
        document.getElementById("weatherResult").innerHTML = `<p style="color:red;">Connection lost to the fruit sensors.</p>`;
    }
}