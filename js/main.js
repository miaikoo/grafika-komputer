document.addEventListener("DOMContentLoaded", () => {
    initSidebar();
    initGrid();
});

function initSidebar() {
    const sidebarList = document.getElementById("sidebar-materi-list");
    
    materiData.forEach(item => {
        const li = document.createElement("li");
        
        const a = document.createElement("a");
        a.href = "#";
        a.className = "nav-item";
        a.id = `nav-${item.id}`;
        
        if (item.path) {
            a.onclick = (e) => loadPraktikum(e, item);
        } else {
            a.style.opacity = "0.5";
            a.style.cursor = "not-allowed";
            a.title = "Belum tersedia";
        }

        a.innerHTML = `
            <i class="ph ${item.icon}"></i>
            Praktikum ${parseInt(item.number)}
        `;
        
        li.appendChild(a);
        sidebarList.appendChild(li);
    });
}

function initGrid() {
    const grid = document.getElementById("materi-grid");
    
    materiData.forEach(item => {
        const card = document.createElement("div");
        card.className = "materi-card";
        
        if (item.path) {
            card.onclick = (e) => loadPraktikum(e, item);
        } else {
            card.style.opacity = "0.6";
            card.style.cursor = "default";
        }

        card.innerHTML = `
            <div class="card-header">
                <span class="card-number">${item.number}</span>
                <i class="ph ${item.icon} card-icon"></i>
            </div>
            <h3 class="card-title">${item.title}</h3>
            <p class="card-desc">${item.description}</p>
            <div class="card-footer">
                <span style="color: var(--text-muted)">Praktikum ${parseInt(item.number)}</span>
                ${item.path ? '<span class="status">Selesai</span>' : '<span style="color: var(--text-muted)">Segera hadir</span>'}
            </div>
        `;
        
        grid.appendChild(card);
    });
}

function loadPraktikum(e, item) {
    e.preventDefault();
    
    // Update active state in sidebar
    document.querySelectorAll(".nav-item").forEach(nav => nav.classList.remove("active"));
    document.getElementById(`nav-${item.id}`).classList.add("active");
    
    // Set iframe src and title
    document.getElementById("praktikum-frame").src = item.path;
    document.getElementById("iframe-title").innerText = `Praktikum ${parseInt(item.number)}: ${item.title}`;
    
    // Switch view
    document.getElementById("dashboard-view").classList.add("hidden");
    document.getElementById("iframe-view").classList.remove("hidden");
}

function goHome(e) {
    e.preventDefault();
    
    // Update active state in sidebar
    document.querySelectorAll(".nav-item").forEach(nav => nav.classList.remove("active"));
    document.getElementById("nav-home").classList.add("active");
    
    // Clear iframe to stop background processing (optional)
    document.getElementById("praktikum-frame").src = "";
    
    // Switch view
    document.getElementById("iframe-view").classList.add("hidden");
    document.getElementById("dashboard-view").classList.remove("hidden");
}
