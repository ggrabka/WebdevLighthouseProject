const checkBackendButton = document.getElementById("checkBackendButton");
const backendStatus = document.getElementById("backendStatus");

checkBackendButton.addEventListener("click", async function () {
    backendStatus.textContent = "Checking backend connection...";
    backendStatus.className = "status-box";

    try {
        const response = await fetch("http://localhost:3000/api/health");

        if (!response.ok) {
            throw new Error("Backend returned an error");
        }

        const data = await response.json();

        backendStatus.textContent = `${data.status}: ${data.message}`;
        backendStatus.className = "status-box status-success";

    } catch (error) {
        backendStatus.textContent = "Backend connection failed. Is the backend running?";
        backendStatus.className = "status-box status-error";

        console.error("Error while calling backend:", error);
    }
});