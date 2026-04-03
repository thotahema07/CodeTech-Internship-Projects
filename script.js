const apiKey = "94638ded49a5fa834b6c107e5d968901";

let chart;

// Get Weather
async function getWeather() {
    let city = document.getElementById("city").value;

    const loader = document.getElementById("loader");
    const error = document.getElementById("error");

    loader.style.display = "block";
    error.innerText = "";

    try {
        let res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`
        );
        let data = await res.json();

        if (data.cod === "404") throw "City not found";

        loader.style.display = "none";

        document.getElementById("weatherCard").style.display = "block";
        document.getElementById("cityName").innerText = data.name;
        document.getElementById("temp").innerText = `${Math.round(data.main.temp)}°C`;
        document.getElementById("desc").innerText = data.weather[0].description;
        document.getElementById("humidity").innerText = data.main.humidity;
        document.getElementById("wind").innerText = data.wind.speed;

        document.getElementById("icon").src =
            `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;

        getForecast(city);

    } catch (err) {
        console.error(err);
        loader.style.display = "none";
        error.innerText = "City not found ❌";
    }
}

// Forecast + Chart
async function getForecast(city) {
    let res = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`
    );
    let data = await res.json();

    let container = document.getElementById("forecastContainer");
    let box = document.getElementById("forecast");

    container.innerHTML = "";

    let dailyData = [];

    for (let i = 0; i < data.list.length; i += 8) {
        let item = data.list[i];
        dailyData.push(item);

        let day = new Date(item.dt_txt).toLocaleDateString("en-US", { weekday: "short" });

        container.innerHTML += `
        <div class="forecast-card">
            <p>${day}</p>
            <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}.png">
            <p>${Math.round(item.main.temp)}°C</p>
        </div>
        `;
    }

    box.style.display = "block";

    renderChart(dailyData);
}

// Chart
function renderChart(dataList) {

    const labels = [];
    const temps = [];

    dataList.forEach(item => {
        const date = new Date(item.dt_txt);
        labels.push(date.toLocaleDateString("en-US", { weekday: "short" }));
        temps.push(item.main.temp);
    });

    const ctx = document.getElementById("weatherChart").getContext("2d");

    if (chart) chart.destroy();

    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, "rgba(255,165,0,0.8)");
    gradient.addColorStop(1, "rgba(255,165,0,0.1)");

    chart = new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [{
                data: temps,
                borderColor: "#ff9800",
                backgroundColor: gradient,
                fill: true,
                tension: 0.4,
                pointRadius: 5
            }]
        },
        options: {
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: "#fff" }, grid: { display: false } },
                y: { ticks: { color: "#fff" }, grid: { color: "rgba(255,255,255,0.2)" } }
            }
        }
    });
}

// Location
function getLocationWeather() {
    navigator.geolocation.getCurrentPosition(async (pos) => {
        let lat = pos.coords.latitude;
        let lon = pos.coords.longitude;

        let res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`
        );

        let data = await res.json();

        document.getElementById("city").value = data.name;
        getWeather();
    });
}