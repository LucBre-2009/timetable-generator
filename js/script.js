const timetable = document.getElementById("timetable");

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];
const HOURS = ["08", "09", "10", "11", "12", "13"];

let state = JSON.parse(localStorage.getItem("timetable")) || {};

// Build grid
function createGrid() {
  timetable.innerHTML = "";

  // header row
  timetable.appendChild(createHeaderCell("Time/Day"));
  DAYS.forEach(day => timetable.appendChild(createHeaderCell(day)));

  HOURS.forEach(hour => {
    timetable.appendChild(createHeaderCell(hour + ":00"));

    DAYS.forEach(day => {
      const key = `${day}-${hour}`;
      const cell = document.createElement("div");
      cell.className = "cell";

      if (state[key]) {
        const subject = createSubject(state[key], key);
        cell.appendChild(subject);
      } else {
        cell.addEventListener("click", () => addSubject(key));
      }

      timetable.appendChild(cell);
    });
  });
}

function createHeaderCell(text) {
  const div = document.createElement("div");
  div.className = "cell font-bold bg-gray-50 flex items-center justify-center";
  div.innerText = text;
  return div;
}

function createSubject(data, key) {
  const div = document.createElement("div");
  div.className = "subject";
  div.style.background = data.color || "#3b82f6";
  div.innerText = data.name;

  div.onclick = () => editSubject(key);

  return div;
}

function addSubject(key) {
  const name = prompt("Subject name?");
  if (!name) return;

  const color = prompt("Color (hex)", "#3b82f6");

  state[key] = { name, color };
  save();
  createGrid();
}

function editSubject(key) {
  const current = state[key];

  const name = prompt("Edit name", current.name);
  if (!name) return;

  const color = prompt("Edit color", current.color);

  state[key] = { name, color };
  save();
  createGrid();
}

function save() {
  localStorage.setItem("timetable", JSON.stringify(state));
}

// Export as image
document.getElementById("exportBtn").onclick = () => {
  html2canvas(timetable).then(canvas => {
    const link = document.createElement("a");
    link.download = "timetable.png";
    link.href = canvas.toDataURL();
    link.click();
  });
};

// Clear
document.getElementById("clearBtn").onclick = () => {
  if (!confirm("Clear timetable?")) return;
  state = {};
  save();
  createGrid();
};

// init
createGrid();
