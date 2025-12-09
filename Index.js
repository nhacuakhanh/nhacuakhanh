// Đăng nhập ADMIN + KHÁCH

document.getElementById("btnLogin").addEventListener("click", login);

function login() {
    const u = username.value.trim();
    const p = password.value.trim();

    // ----- Admin -----
    if (u === "khanhchunha" && p === "khanh0311") {
        localStorage.setItem("session", JSON.stringify({ role: "admin" }));
        window.location = "admin.html";
        return;
    }

    // ----- Login Khách -----
    const found = StorageAPI.findGuestByPhone(u);

    if (!found) {
        alert("Sai tài khoản hoặc chưa có thông tin khách!");
        return;
    }

    if (p !== u) {
        alert("Mật khẩu khách phải trùng số điện thoại!");
        return;
    }

    const { baseId, floorId, roomId } = found;

    localStorage.setItem("session", JSON.stringify({
        role: "guest",
        phone: u,
        baseId,
        floorId,
        roomId
    }));

    window.location = "khach.html";
}
