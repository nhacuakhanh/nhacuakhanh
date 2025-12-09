const baseId = localStorage.getItem("currentBaseId");
const floorId = localStorage.getItem("currentFloorId");

const roomList = document.getElementById("roomList");

function addRoom() {
    const name = document.getElementById("roomName").value.trim();
    if (!name) return;

    StorageAPI.addRoom(baseId, floorId, name);
    document.getElementById("roomName").value = "";
    loadRooms();
}

function loadRooms() {
    const rooms = StorageAPI.getRooms(baseId, floorId);
    roomList.innerHTML = "";

    rooms.forEach(r => {
        const li = document.createElement("li");
        li.className = "list-item";
        li.textContent = r.name;
        li.onclick = () => {
            localStorage.setItem("currentRoomId", r.id);
            window.location = "khach.html";
        };
        roomList.appendChild(li);
    });
}

function back() {
    window.location = "tang.html";
}

loadRooms();
