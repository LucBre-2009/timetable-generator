const timetable = document.getElementById("timetable");

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

let timeSlots = JSON.parse(localStorage.getItem("slots")) || [];
let state = JSON.parse(localStorage.getItem("timetable")) || {};

let lang = localStorage.getItem("lang") || "en";

let currentEdit = null;

// ---------------- TEXT ----------------
const T = {
  en: {
    title: "Timetable Generator",
    addSlot: "Add Slot",
    subject: "Subject",
    save: "Save",
    cancel: "Cancel",
    clear: "Clear everything",
    emptySlot: "Subject name?"
  },
  de: {
    title: "Stundenplan Generator",
    addSlot: "Zeit hinzufügen",
    subject: "Fach",
    save: "Speichern",
    cancel: "Abbrechen",
    clear: "Alles löschen",
    emptySlot: "Fachname?"
  }
};

// ---------------- SAVE ----------------
function save() {
  localStorage.setItem("slots", JSON.stringify(timeSlots));
  localStorage.setItem("timetable", JSON.stringify(state));
  localStorage.setItem("lang", lang);
}

// ---------------- LANGUAGE APPLY ----------------
function applyLang() {
  document.getElementById("title").innerText = T[lang].title;
  document.getElementById("addSlotBtn").innerText = T[lang].addSlot;
  document.getElementById("saveBtn").innerText = T[lang].save;
  document.getElementById("cancelBtn").innerText = T[lang].cancel;
}

// ---------------- GRID ----------------
function createGrid() {
  timetable.innerHTML = "";

  timetable.appendChild(header("Time / Day"));
  DAYS.forEach(d => timetable.appendChild(header(d)));

  timeSlots.forEach(slot => {
    timetable.appendChild(header(slot));

    DAYS.forEach(day => {
      const key = `${day}-${slot}`;

      const cell = document.createElement("div");
      cell.className = "cell";

      cell.onclick = () => openModal(key);

      if (state[key]) {
        const el = document.createElement("div");
        el.className = "subject";
        el.style.background = state[key].color;
        el.innerText = state[key].name;
        cell.appendChild(el);
      }

      timetable.appendChild(cell);
    });
  });
}

// ---------------- HEADER ----------------
function header(text) {
  const div = document.createElement("div");
  div.className = "cell font-bold bg-gray-50 flex items-center justify-center";
  div.innerText = text;
  return div;
}

// ---------------- MODAL ----------------
function openModal(key) {
  currentEdit = key;

  const modal = document.getElementById("modal");
  modal.classList.remove("hidden");

  document.getElementById("subjectName").value =
    state[key]?.name || "";

  document.getElementById("colorPicker").value =
    state[key]?.color || "#3b82f6";

  document.getElementById("modalTitle").innerText = T[lang].subject;
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
  currentEdit = null;
}

// ---------------- SAVE SUBJECT ----------------
document.getElementById("saveBtn").onclick = () => {
  const name = document.getElementById("subjectName").value;
  const color = document.getElementById("colorPicker").value;

  if (!name) return;

  state[currentEdit] = { name, color };

  save();
  createGrid();
  closeModal();
};

// ---------------- CANCEL ----------------
document.getElementById("cancelBtn").onclick = closeModal;

// ---------------- SLOT ADD ----------------
document.getElementById("addSlotBtn").onclick = () => {
  const start = document.getElementById("startTime").value;
  const end = document.getElementById("endTime").value;

  if (!start || !end) return;

  const slot = `${start}-${end}`;

  if (!timeSlots.includes(slot)) {
    timeSlots.push(slot);
    timeSlots.sort((a,b)=>a.split("-")[0].localeCompare(b.split("-")[0]));
    save();
    createGrid();
  }
};

// ---------------- LANGUAGE SWITCH FIX ----------------
document.getElementById("langSelect").onchange = (e) => {
  lang = e.target.value;
  save();
  applyLang();
  createGrid(); // IMPORTANT FIX
};

// ---------------- EXPORT ----------------
document.getElementById("exportBtn").onclick = () => {
  html2canvas(timetable).then(canvas => {
    const a = document.createElement("a");
    a.download = "timetable.png";
    a.href = canvas.toDataURL();
    a.click();
  });
};

// ---------------- CLEAR ----------------
document.getElementById("clearBtn").onclick = () => {
  if (!confirm(T[lang].clear)) return;

  state = {};
  timeSlots = [];

  save();
  createGrid();
};

// ---------------- INIT ----------------
applyLang();
createGrid();
