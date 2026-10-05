function formatAdjustment(amount, unit) {
    return `${Math.abs(amount).toFixed(1)}${unit}`;
}

function getAdjustmentStatus(key, value, min, max) {
    if (value < min) {
        if (key === "temperature") return { text: "Too cold", amount: min - value, unit: "°C" };
        if (key === "ph") return { text: "Too acidic", amount: min - value, unit: "" };
        if (key === "salinity") return { text: "Too low", amount: min - value, unit: " ppt" };
        if (key === "turbidity") return { text: "Too clear", amount: min - value, unit: " NTU" };
    }

    if (value > max) {
        if (key === "temperature") return { text: "Too hot", amount: value - max, unit: "°C" };
        if (key === "ph") return { text: "Too alkaline", amount: value - max, unit: "" };
        if (key === "salinity") return { text: "Too high", amount: value - max, unit: " ppt" };
        if (key === "turbidity") return { text: "Too cloudy", amount: value - max, unit: " NTU" };
    }

    return { text: "Within range", amount: 0, unit: "" };
}

function updateSensorAdjustments() {
    const latestReading = JSON.parse(localStorage.getItem("shrimpGuardLatest") || "null");

    const sensorConfig = {
        temperature: { min: 26, max: 32 },
        ph: { min: 7.5, max: 8.5 },
        salinity: { min: 15, max: 30 },
        turbidity: { min: 0, max: 30 }
    };

    Object.entries(sensorConfig).forEach(([key, config]) => {
        const valueElement = document.getElementById(`${key}-adjustment`);
        const statusElement = document.getElementById(`${key}-status`);

        if (!valueElement || !statusElement) {
            return;
        }

        if (!latestReading) {
            valueElement.textContent = "--";
            statusElement.textContent = "Waiting for reading";
            return;
        }

        const readingValue = Number(latestReading[key]);
        const adjustment = getAdjustmentStatus(key, readingValue, config.min, config.max);

        if (adjustment.amount === 0) {
            valueElement.textContent = "0.0";
            statusElement.textContent = "(Within range)";
            return;
        }

        valueElement.textContent = formatAdjustment(adjustment.amount, adjustment.unit);
        statusElement.textContent = `(${adjustment.text})`;
    });
}

function updateDeviceTime() {
    document.getElementById("time").textContent =
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

updateDeviceTime();
updateSensorAdjustments();
setInterval(updateDeviceTime, 1000);
setInterval(updateSensorAdjustments, 1000);
window.addEventListener("storage", updateSensorAdjustments);
