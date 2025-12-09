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
// =======================
// XUẤT PDF MB BANK STYLE
// =======================

btnExportPDF.onclick = () => {
    generatePDF(guest);
};

function generatePDF(guest) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: "mm", format: "a4" });

    let y = 10;

    // HEADER MB BANK
    doc.setFillColor(0, 62, 169);
    doc.rect(0, 0, 210, 30, "F");

    doc.setFontSize(18);
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.text("HÓA ĐƠN TIỀN PHÒNG", 105, 12, { align: "center" });

    doc.setFontSize(12);
    doc.text("Nhà Của Khánh", 105, 20, { align: "center" });

    y = 38;
    doc.setTextColor(0, 0, 0);

    // Title section
    function section(title) {
        doc.setFontSize(14);
        doc.setFont("Helvetica", "bold");
        doc.text(title, 10, y);
        y += 4;
        doc.setDrawColor(200);
        doc.line(10, y, 200, y);
        y += 6;
        doc.setFont("Helvetica", "normal");
    }

    function row(label, value) {
        doc.setFontSize(12);
        doc.text(`• ${label}: ${value}`, 12, y);
        y += 7;
    }

    // THÔNG TIN PHÒNG
    const floors = StorageAPI.getFloors(baseId);
    const floor = floors.find(f => f.id === floorId);

    const rooms = StorageAPI.getRooms(baseId, floorId);
    const room = rooms.find(r => r.id === roomId);

    const base = StorageAPI.getBases().find(b => b.id === baseId);

    section("Thông tin phòng");
    row("Cơ sở", base.name);
    row("Tầng", floor.name);
    row("Phòng", room.name);
    row("Ngày in", new Date().toLocaleDateString("vi-VN"));

    y += 4;

    // THÔNG TIN KHÁCH
    section("Thông tin khách");
    row("Họ tên", guest.fullName);
    row("Số điện thoại", guest.phone);
    row("CCCD", guest.cccd);
    row("Số người", guest.people);
    row("Tiền thuê", vnd(guest.rent));

    y += 4;

    // DỊCH VỤ
    section("Dịch vụ");
    row("Nước", vnd(guest.svcWater) + " × " + guest.people);
    row("Rác", vnd(guest.svcTrash) + " × " + guest.people);
    row("Wifi", vnd(guest.svcWifi));
    row("Lọc", vnd(guest.svcFilter) + " × " + guest.people);
    row("Giặt", vnd(guest.svcWash) + " × " + guest.people);
    row("Sấy", vnd(guest.svcDry) + " × " + guest.people);
    row("Vệ sinh", vnd(guest.svcClean) + " × " + guest.people);

    y += 4;

    // ĐIỆN PHÒNG
    section("Điện phòng");
    row("Công tơ cũ", guest.meterRoomOld);
    row("Công tơ mới", guest.meterRoomNew);
    row("Tiêu thụ", guest.meterRoomNew - guest.meterRoomOld);
    row("Giá điện", vnd(guest.priceRoom));
    row("Thành tiền", vnd(guest.roomElectric));

    y += 4;

    // ĐIỆN CHUNG
    section("Điện chung");
    row("Tổng điện chung", vnd(guest.commonElectric));

    y += 6;

    // TỔNG TIỀN — Ô XANH MB
    doc.setFillColor(0, 62, 169);
    doc.roundedRect(10, y, 190, 20, 3, 3, "F");

    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.text("TỔNG TIỀN PHẢI TRẢ", 15, y + 7);

    doc.setFontSize(18);
    doc.text(vnd(guest.total), 195, y + 12, { align: "right" });

    y += 32;

    // =======================
    // QR THANH TOÁN BO GÓC
    // =======================

    const qrUrl = `https://img.vietqr.io/image/mbbank-0200356789999-compact.png?amount=${guest.total}`;

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("QR THANH TOÁN", 105, y, { align: "center" });
    y += 6;

    doc.setFontSize(11);
    doc.text("(Quét để thanh toán tiền phòng)", 105, y, { align: "center" });
    y += 8;

    const qrX = 65;
    const qrY = y;
    const qrSize = 80;

    // khung bo góc
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(qrX - 5, qrY - 5, qrSize + 10, qrSize + 10, 6, 6, "F");

    // QR
    doc.addImage(qrUrl, "PNG", qrX, qrY, qrSize, qrSize);

    y += qrSize + 20;

    doc.setFontSize(12);
    doc.text("MB Bank – Nguyễn Gia Khánh", 105, y, { align: "center" });
    y += 6;
    doc.text("STK: 0200356789999", 105, y, { align: "center" });

    y += 20;

    doc.setFontSize(11);
    doc.text("Cảm ơn bạn đã thuê phòng tại Nhà Của Khánh!", 105, y, { align: "center" });

    doc.save(`hoadon_${room.name}_${Date.now()}.pdf`);
        }
