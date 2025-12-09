// ADMIN - Quản lý cơ sở

const baseName = document.getElementById("baseName");
const baseList = document.getElementById("baseList");

baseName.addEventListener("keydown", e => {
    if (e.key === "Enter") {
        addBase();
    }
});

function addBase() {
    if (!baseName.value.trim()) return;
    StorageAPI.addBase(baseName.value.trim());
    baseName.value = "";
    loadBases();
}

function loadBases() {
    const bases = StorageAPI.getBases();
    baseList.innerHTML = "";

    bases.forEach(b => {
        const li = document.createElement("li");
        li.className = "list-item";
        li.textContent = b.name;
        li.onclick = () => {
            localStorage.setItem("currentBaseId", b.id);
            window.location = "tang.html";
        };
        baseList.appendChild(li);
    });
}

function logout() {
    localStorage.removeItem("session");
    window.location = "index.html";
}

loadBases();
