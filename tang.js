const baseId = localStorage.getItem("currentBaseId");
const floorList = document.getElementById("floorList");

function createFloors() {
    const n = Number(document.getElementById("floorCount").value);
    if (!n || n < 1) return alert("Số tầng không hợp lệ!");

    StorageAPI.autoCreateFloors(baseId, n);
    loadFloors();
}

function loadFloors() {
    const floors = StorageAPI.getFloors(baseId);
    floorList.innerHTML = "";

    floors.forEach(f => {
        const li = document.createElement("li");
        li.className = "list-item";
        li.textContent = f.name;
        li.onclick = () => {
            localStorage.setItem("currentFloorId", f.id);
            window.location = "phong.html";
        };
        floorList.appendChild(li);
    });
}

function back() {
    window.location = "admin.html";
}

loadFloors();
