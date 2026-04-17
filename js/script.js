const timetable = document.getElementById("timetable");

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

// STATE
let timeSlots = JSON.parse(localStorage.getItem("slots")) || [
  "07:50-08:35",
  "08:40-09:25"
];

let state = JSON.parse(localStorage.getItem("timetable")) || {};

// SAVE
function save() {
  localStorage.setItem("slots", JSON.stringify(timeSlots));
  localStorage.setItem("timetable", JSON.stringify(state));
}

// GRID
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

      if (state[key]) {
        const el = subject(state[key], key);
        cell.appendChild(el);
      } else {
        cell.onclick = () => addSubject(key);
      }

      timetable.appendChild(cell);
    });
  });
}

// HEADER
function header(text) {
  const div = document.createElement("div");
  div.className = "cell font-bold bg-gray-50 flex items-center justify-center";
  div.innerText = text;
  return div;
}

// SUBJECT
function subject(data, key) {
  const div = document.createElement("div");
  div.className = "subject";
  div.style.background = data.color || "#3b82f6";
  div.innerText = data.name;

  div.onclick = () => editSubject(key);

  return div;
}

// ADD SUBJECT
function addSubject(key) {
  const name = prompt("Subject name?");
  if (!name) return;

  const color = prompt("Color hex", "#3b82f6");

  state[key] = { name, color };

  save();
  createGrid();
}

// EDIT SUBJECT
function editSubject(key) {
  const current = state[key];

  const name = prompt("Edit name", current.name);
  if (!name) return;

  const color = prompt("Edit color", current.color);

  state[key] = { name, color };

  save();
  createGrid();
}

// ADD SLOT
document.getElementById("addSlotBtn").onclick = () => {
  const start = document.getElementById("startTime").value;
  const end = document.getElementById("endTime").value;

  if (!start || !end) return alert("Select start & end time");

  const slot = `${start}-${end}`;

  if (timeSlots.includes(slot)) return alert("Slot exists");

  timeSlots.push(slot);

  timeSlots.sort((a, b) =>
    a.split("-")[0].localeCompare(b.split("-")[0])
  );

  save();
  createGrid();
};

// EXPORT
document.getElementById("exportBtn").onclick = () => {
  html2canvas(timetable).then(canvas => {
    const link = document.createElement("a");
    link.download = "timetable.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
};

// CLEAR
document.getElementById("clearBtn").onclick = () => {
  if (!confirm("Clear everything?")) return;

  state = {};
  timeSlots = ["07:50-08:35", "08:40-09:25"];

  save();
  createGrid();
};

// INIT
createGrid();
