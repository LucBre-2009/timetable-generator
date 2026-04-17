const timetable = document.getElementById("timetable");

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

let timeSlots = JSON.parse(localStorage.getItem("slots")) || [];
let state = JSON.parse(localStorage.getItem("events")) || [];

let undoStack = [];
let redoStack = [];

let dragItem = null;

// ---------------- SAVE ----------------
function save() {
  localStorage.setItem("slots", JSON.stringify(timeSlots));
  localStorage.setItem("events", JSON.stringify(state));
}

// ---------------- HISTORY ----------------
function pushHistory() {
  undoStack.push(JSON.stringify(state));
  if (undoStack.length > 50) undoStack.shift();
  redoStack = [];
}

function undo() {
  if (!undoStack.length) return;

  redoStack.push(JSON.stringify(state));
  state = JSON.parse(undoStack.pop());
  save();
  createGrid();
}

function redo() {
  if (!redoStack.length) return;

  undoStack.push(JSON.stringify(state));
  state = JSON.parse(redoStack.pop());
  save();
  createGrid();
}

// ---------------- GRID ----------------
function createGrid() {
  timetable.innerHTML = "";

  timetable.appendChild(header("Time / Day"));
  DAYS.forEach(d => timetable.appendChild(header(d)));

  timeSlots.forEach(slot => {
    timetable.appendChild(header(slot));

    DAYS.forEach(day => {
      const cell = document.createElement("div");
      cell.className = "cell";

      const events = getEvents(day, slot);

      cell.ondragover = (e) => {
        e.preventDefault();
        cell.classList.add("bg-blue-50");
      };

      cell.ondragleave = () => {
        cell.classList.remove("bg-blue-50");
      };

      cell.ondrop = (e) => handleDrop(e, day, slot);

      cell.onclick = () => addEvent(day, slot);

      events.forEach(ev => {
        cell.appendChild(renderEvent(ev));
      });

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

// ---------------- GET EVENTS ----------------
function getEvents(day, slot) {
  return state.filter(e => e.day === day && e.slot === slot);
}

// ---------------- RENDER EVENT ----------------
function renderEvent(ev) {
  const div = document.createElement("div");

  div.className = "subject";
  div.style.background = ev.color;
  div.innerText = ev.name;

  div.draggable = true;

  // DRAG START
  div.ondragstart = (e) => {
    dragItem = ev;
    e.dataTransfer.setData("text/plain", JSON.stringify(ev));
  };

  // TOUCH SUPPORT (basic mobile drag)
  div.ontouchstart = () => {
    dragItem = ev;
  };

  // DOUBLE CLICK DUPLICATE
  div.ondblclick = () => {
    pushHistory();

    state.push({
      ...ev,
      id: crypto.randomUUID()
    });

    save();
    createGrid();
  };

  return div;
}

// ---------------- DROP ----------------
function handleDrop(e, day, slot) {
  e.preventDefault();

  const data = e.dataTransfer.getData("text/plain");
  let ev = dragItem;

  if (!ev && data) {
    ev = JSON.parse(data);
  }

  if (!ev) return;

  pushHistory();

  // remove old
  state = state.filter(e => e.id !== ev.id);

  // add new position
  state.push({
    ...ev,
    day,
    slot
  });

  dragItem = null;

  save();
  createGrid();
}

// ---------------- ADD EVENT ----------------
function addEvent(day, slot) {
  const name = prompt("Subject name?");
  if (!name) return;

  const color = prompt("Color hex", "#3b82f6");

  pushHistory();

  state.push({
    id: crypto.randomUUID(),
    day,
    slot,
    name,
    color
  });

  save();
  createGrid();
}

// ---------------- INIT ----------------
createGrid();

// expose undo/redo for buttons if needed
window.undo = undo;
window.redo = redo;
