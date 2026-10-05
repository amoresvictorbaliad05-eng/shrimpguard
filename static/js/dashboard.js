function displayResults(data) {

        // TEMPERATURE

        document.getElementById("temperature").textContent =
            data.temperature + " °C";


        // PH

        document.getElementById("ph").textContent =
            data.ph;


        // SALINITY

        document.getElementById("salinity").textContent =
            data.salinity + " ppt";


        // TURBIDITY

        document.getElementById("turbidity").textContent =
            data.turbidity + " NTU";


        // STATUS

        updateStatus(data);

        // WQI

        calculateWQI(data);

        // ALERTS

        createAlerts(data);

}


async function saveReading(data) {
    const reading = {
        ...data,
        recorded_at: new Date().toISOString()
    };

    try {
        const response = await fetch("/api/readings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(reading)
        });

        if (!response.ok) {
            throw new Error("Unable to save reading to MySQL");
        }

        const savedReading = await response.json();
        const history = JSON.parse(localStorage.getItem("shrimpGuardHistory") || "[]");
        const updatedHistory = [...history, savedReading].slice(-20);

        localStorage.setItem("shrimpGuardLatest", JSON.stringify(savedReading));
        localStorage.setItem("shrimpGuardHistory", JSON.stringify(updatedHistory));
        return savedReading;
    } catch (error) {
        const history = JSON.parse(localStorage.getItem("shrimpGuardHistory") || "[]");
        history.push(reading);
        localStorage.setItem("shrimpGuardLatest", JSON.stringify(reading));
        localStorage.setItem("shrimpGuardHistory", JSON.stringify(history.slice(-20)));
        return reading;
    }
}


function updateDeviceTime() {
    document.getElementById("time").textContent =
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}


function updateStatus(data) {

    let status =
        "✓ Overall water quality is GOOD.";

    if (data.temperature < 26 || data.temperature > 32 || data.ph < 7.5 || data.ph > 8.5 || data.salinity < 15 || data.salinity > 30 || data.turbidity > 30) {

        status =
            "⚠ Overall water quality needs attention.";

    }

    document.getElementById("overall-status").textContent =
        status;

}


function calculateWQI(data) {

    let wqi = 100;


    if (data.temperature < 26 || data.temperature > 32) {
        wqi -= 10;
    }

    if (data.ph < 7.5 || data.ph > 8.5) {
        wqi -= 10;
    }

    if (data.salinity < 15 || data.salinity > 30) {
        wqi -= 10;
    }

    if (data.turbidity > 30) {
        wqi -= 15;
    }

    document.getElementById("wqi-value").textContent =
        wqi;


    let status = "GOOD";


    if (wqi < 70) {
        status = "WARNING";
    }


    document.getElementById("wqi-status").textContent =
        status;

}


function createAlerts(data) {

    const alerts =
        document.getElementById("alerts");


    alerts.innerHTML = "";

    const alertItems = [];


    if (data.temperature < 26 || data.temperature > 32) {

        const severity = data.temperature < 24 || data.temperature > 34 ? "Critical" : "Mild";

        alertItems.push({
            severity,
            title: `${severity} Temperature Alert`,
            message: `Temperature is currently ${data.temperature} °C, which is outside the recommended range of 26–32 °C.`,
            notification: `SMS: Pond temperature is ${data.temperature} °C. Check cooling or heating systems and respond to avoid stress on shrimp.`
        });

    }


    if (data.ph < 7.5 || data.ph > 8.5) {

        const severity = data.ph < 7.0 || data.ph > 9.0 ? "Critical" : "Mild";

        alertItems.push({
            severity,
            title: `${severity} pH Alert`,
            message: `pH is currently ${data.ph}, which is outside the recommended range of 7.5–8.5.`,
            notification: `SMS: pH is ${data.ph}. Adjust water treatment and confirm the pH control system is working properly.`
        });

    }


    if (data.salinity < 15 || data.salinity > 30) {

        const severity = data.salinity < 12 || data.salinity > 33 ? "Critical" : "Mild";

        alertItems.push({
            severity,
            title: `${severity} Salinity Alert`,
            message: `Salinity is currently ${data.salinity} ppt, which is outside the recommended range of 15–30 ppt.`,
            notification: `SMS: Salinity is ${data.salinity} ppt. Verify water exchange and salinity adjustments before the next cycle.`
        });

    }


    if (data.turbidity > 30) {

        const severity = data.turbidity > 40 ? "Critical" : "Mild";

        alertItems.push({
            severity,
            title: `${severity} Turbidity Alert`,
            message: `Turbidity is currently ${data.turbidity} NTU, which is above the recommended limit of 30 NTU.`,
            notification: `SMS: Turbidity is ${data.turbidity} NTU. Increase filtration and inspect for excess sediment or feed buildup.`
        });

    }


    if (alertItems.length === 0) {

        alerts.innerHTML = `

            <div class="status-box">

                ✓ No abnormal readings detected. Alerts and notifications are normal.

            </div>

        `;

        return;

    }


    alertItems.forEach((item) => {

        alerts.innerHTML += `

            <div class="alert">

                ${item.severity === "Critical" ? "⚠" : "📣"} ${item.title}

                <br>

                ${item.message}

                <br><br>

                <strong>Notification:</strong> ${item.notification}

            </div>

        `;

    });

}

updateDeviceTime();
setInterval(updateDeviceTime, 1000);


document.getElementById("quality-form").addEventListener("submit", async function (event) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const data = {
        temperature: Number(formData.get("temperature")),
        ph: Number(formData.get("ph")),
        salinity: Number(formData.get("salinity")),
        turbidity: Number(formData.get("turbidity"))
    };

    const savedReading = await saveReading(data);
    displayResults(savedReading);
});