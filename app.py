from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

API_KEY = os.getenv("API_KEY")  # Your OpenWeather API key

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/weather", methods=["GET", "POST"])
def get_weather():
    if request.method == "POST":
        data = request.json
        lat = data.get("lat")
        lon = data.get("lon")
        city = None
    else:
        city = request.args.get("city")
        lat = lon = None

    if city:
        geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={API_KEY}"
        geo_res = requests.get(geo_url).json()
        if not geo_res:
            return jsonify({"error": "City not found"}), 404
        lat, lon = geo_res[0]["lat"], geo_res[0]["lon"]

    if not lat or not lon:
        return jsonify({"error": "Latitude and Longitude are required"}), 400

    url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    weather_data = requests.get(url).json()

    if weather_data.get("cod") != 200:
        return jsonify({"error": "Failed to get weather"}), 500

    rain = weather_data.get("rain", {}).get("1h", 0)  # mm in last 1h
    wind_speed = weather_data["wind"]["speed"]  # m/s
    description = weather_data["weather"][0]["description"]

    alert = None
    if rain > 10 or wind_speed > 15:
        alert = "⚠️ Dangerous weather — stay safe!"
    elif rain > 2 or wind_speed > 8:
        alert = "☔ Moderate weather alert"
    else:
        alert = "✅ Weather looks fine"

    return jsonify({
        "city": weather_data["name"],
        "description": description,
        "temperature": weather_data["main"]["temp"],
        "rain_mm": rain,
        "wind_speed": wind_speed,
        "alert": alert
    })

if __name__ == "__main__":
    app.run(debug=True)
