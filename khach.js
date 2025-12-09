let session = JSON.parse(localStorage.getItem("session") || "{}");

const baseId = session.baseId || localStorage.getItem("currentBaseId");
const floorId = session.floorId || localStorage.getItem("currentFloorId");
const roomId = session.roomId || localStorage.getItem("currentRoomId");

let isGuest = session.role === "guest";
let guest = StorageAPI.getGuest(baseId, floorId, roomId) || {};

function loadFields() {
    fullName.value = guest.fullName || "";
    phone.value = guest.phone || "";
    cccd.value = guest.cccd || "";
    rent.value = guest.rent || "";
    people.value = guest.people || "";
    vehicles.value = guest.vehicles || "";
    contractMonths.value = guest.contractMonths || "";
    startDate.value = guest.startDate || "";
    endDate.value = guest.endDate || "";

    svcWater.value = guest.svcWater || "";
    svcTrash.value = guest.svcTrash || "";
    svcWifi.value = guest.svcWifi || "";
    svcFilter.value = guest.svcFilter || "";
    svcWash.value = guest.svcWash || "";
    svcDry.value = guest.svcDry || "";
    svcClean.value = guest.svcClean || "";

    meterRoomOld.value = guest.meterRoomOld || "";
    meterRoomNew.value = guest.meterRoomNew || "";
    priceRoom.value = guest.priceRoom || "";

    meterCommonOld.value = guest.meterCommonOld || "";
    meterCommonNew.value = guest.meterCommonNew || "";
    priceCommon.value = guest.priceCommon || "";
}

loadFields();
function setMode() {
    if (isGuest) {
        document.querySelectorAll("#fullName,#phone,#cccd,#rent,#people,#vehicles,#contractMonths,#startDate,#svcWater,#svcTrash,#svcWifi,#svcFilter,#svcWash,#svcDry,#svcClean,#priceRoom,#priceCommon,#meterCommonOld,#meterCommonNew")
            .forEach(el => el.setAttribute("readonly", true));

        btnSaveInfo.style.display = "none";
        btnEdit.style.display = "none";
        btnDelete.style.display = "none";
    }
}

setMode();
btnSaveInfo.onclick = () => {
    guest = {
        fullName: fullName.value,
        phone: phone.value,
        cccd: cccd.value,
        rent: Number(rent.value),
        people: Number(people.value),
        vehicles: Number(vehicles.value),
        contractMonths: Number(contractMonths.value),
        startDate: startDate.value,
        endDate: endDate.value,

        svcWater: Number(svcWater.value),
        svcTrash: Number(svcTrash.value),
        svcWifi: Number(svcWifi.value),
        svcFilter: Number(svcFilter.value),
        svcWash: Number(svcWash.value),
        svcDry: Number(svcDry.value),
        svcClean: Number(svcClean.value),

        meterRoomOld: guest.meterRoomOld || 0,
        meterRoomNew: guest.meterRoomNew || 0,
        meterCommonOld: guest.meterCommonOld || 0,
        meterCommonNew: guest.meterCommonNew || 0,
        priceRoom: guest.priceRoom || 0,
        priceCommon: guest.priceCommon || 0
    };

    StorageAPI.saveGuest(baseId, floorId, roomId, guest);
    alert("Lưu thành công!");
};
btnEdit.onclick = () => {
    document.querySelectorAll("input").forEach(el => el.removeAttribute("readonly"));
};

btnDelete.onclick = () => {
    if (!confirm("Xóa khách này?")) return;
    StorageAPI.deleteGuest(baseId, floorId, roomId);
    alert("Đã xóa!");
    window.location.reload();
};
btnCalc.onclick = () => {
    const roomOld = Number(meterRoomOld.value);
    const roomNew = Number(meterRoomNew.value);
    const priceR = Number(priceRoom.value);

    const commonOld = Number(meterCommonOld.value);
    const commonNew = Number(meterCommonNew.value);
    const priceC = Number(priceCommon.value);

    const diffRoom = roomNew - roomOld;
    const diffCommon = commonNew - commonOld;

    const rooms = StorageAPI.getRooms(baseId, floorId);
    let totalPeople = 0;

    const floors = StorageAPI.getFloors(baseId);
    floors.forEach(f => {
        StorageAPI.getRooms(baseId, f.id).forEach(r => {
            const g = StorageAPI.getGuest(baseId, f.id, r.id);
            if (g) totalPeople += Number(g.people);
        });
    });

    const roomElectric = diffRoom * priceR;
    const commonPerPerson = (diffCommon * priceC) / (totalPeople || 1);
    const commonElectric = commonPerPerson * Number(people.value);

    const service = (
        guest.svcWater +
        guest.svcTrash +
        guest.svcFilter +
        guest.svcWash +
        guest.svcDry +
        guest.svcClean
    ) * Number(people.value) + guest.svcWifi;

    const total = Number(guest.rent) + roomElectric + commonElectric + service;

    guest.meterRoomOld = roomOld;
    guest.meterRoomNew = roomNew;
    guest.meterCommonOld = commonOld;
    guest.meterCommonNew = commonNew;
    guest.priceRoom = priceR;
    guest.priceCommon = priceC;

    guest.roomElectric = roomElectric;
    guest.commonElectric = commonElectric;
    guest.serviceTotal = service;
    guest.total = total;

    StorageAPI.saveGuest(baseId, floorId, roomId, guest);

    resultBox.style.display = "block";
    resultText.innerHTML = `
        Điện phòng: ${vnd(roomElectric)}<br>
        Điện chung: ${vnd(commonElectric)}<br>
        Dịch vụ: ${vnd(service)}<br>
        <b>Tổng: ${vnd(total)}</b>
    `;

    btnExportPDF.style.display = "block";
};
