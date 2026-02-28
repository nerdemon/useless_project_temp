from flask import Flask, render_template, request, jsonify
import requests
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

API_KEY = os.getenv("API_KEY")

@app.route("/")
def home():
    return render_template("index.html")

@app.route("/weather", methods=["GET", "POST"])
def get_weather():
    lat = lon = city = None

    if request.method == "POST":
        data = request.json
        lat, lon = data.get("lat"), data.get("lon")
    else:
        city = request.args.get("city")
        lat, lon = request.args.get("lat"), request.args.get("lon")

    if city and not (lat and lon):
        geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={API_KEY}"
        try:
            geo_res = requests.get(geo_url).json()
            if not geo_res:
                return jsonify({"error": "Ithoke eth sthalavede? (Place not found)"}), 404
            lat, lon = geo_res[0]["lat"], geo_res[0]["lon"]
        except Exception:
            return jsonify({"error": "Geocoding failed. Try again!"}), 500

    if not lat or not lon:
        return jsonify({"error": "Oru rekshayillaatto (Location missing)"}), 400

    url = f"http://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API_KEY}&units=metric"
    weather_res = requests.get(url).json()

    if weather_res.get("cod") != 200:
        return jsonify({"error": "Aliya thenj (Weather API Error)"}), 500

    rain = weather_res.get("rain", {}).get("1h", 0)
    wind_speed = weather_res.get("wind", {}).get("speed", 0)
    
    # --- FALLING FRUIT PHYSICS LOGIC ---
    play_sound = False
    
    if wind_speed > 20 or rain > 15:
        threat = "🔴 EXTREME"
        alert = "🚨 AYYOOOO SOOKSHIKKANE! Winds are wild! Jackfruits and Coconuts are dropping like meteors! Seek shelter immediately! 🥥☄️"
        play_sound = True
    elif wind_speed > 12 or rain > 8:
        threat = "🟠 HIGH"
        alert = "⚠️ Heavy winds! Coconuts (Thenga) are unstable. Do not park your vehicle under a palm tree! 🥥🌴"
        play_sound = True
    elif wind_speed > 6 or rain > 2:
        threat = "🟡 MODERATE"
        alert = "☔ Mazha peyyunnu! Wind is picking up. Slippery mangoes and small twigs falling. Walk carefully! 🥭🍃"
        play_sound = True
    else:
        threat = "🟢 SAFE"
        alert = "✅ Scenilla mwonu! Perfect weather. Gravity is resting. No falling fruits today, go out and chill. 😎"

    return jsonify({
        "city": weather_res.get("name"),
        "description": weather_res["weather"][0]["description"].title(),
        "temperature": weather_res["main"]["temp"],
        "rain_mm": rain,
        "wind_speed": wind_speed,
        "threat_level": threat,
        "alert": alert,
        "play_sound": play_sound
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)