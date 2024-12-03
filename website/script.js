const tableContainer = document.getElementById("data-table");
const sortableContainer = document.getElementById("sortable-container");
const applySortingButton = document.getElementById("apply-sorting");
const weightInputsContainer = document.getElementById("weights-container");

fetch("../Resources/states_data.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Failed to load the JSON file.");
    }
    return response.json();
  })
  .then((jsonData) => {
    data = jsonData;
    fields = Object.keys(data[0]);
    displayTable(); // Display data in table
    initDraggableFields(); // Initialize drag-and-drop for fields
    initWeightInputs(); // Initialize weight inputs for fields
  })
  .catch((error) => console.error(error));

// Display the data table
function displayTable() {
  tableContainer.innerHTML = ""; // Clear the table
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  // Create header row
  const headerRow = document.createElement("tr");
  fields.forEach((field) => {
    const th = document.createElement("th");
    th.textContent = field;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  // Create data rows (limited to top 10)
  data.slice(0, 10).forEach((row) => {
    const tr = document.createElement("tr");
    fields.forEach((field) => {
      const td = document.createElement("td");
      td.textContent = row[field];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });

  tableContainer.appendChild(thead);
  tableContainer.appendChild(tbody);
}

// Initialize draggable fields
function initDraggableFields() {
  sortableContainer.innerHTML = ""; // Clear the container

  fields.forEach((field) => {
    const item = document.createElement("div");
    item.className = "sortable-item";
    item.draggable = true;
    item.textContent = field;

    // Add drag-and-drop listeners
    item.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", field);
      item.classList.add("dragging");
    });

    item.addEventListener("dragend", () => {
      item.classList.remove("dragging");
    });

    sortableContainer.appendChild(item);
  });

  // Drag-over event for container
  sortableContainer.addEventListener("dragover", (e) => {
    e.preventDefault();
    const afterElement = getDragAfterElement(sortableContainer, e.clientY);
    const draggingItem = document.querySelector(".dragging");
    if (afterElement == null) {
      sortableContainer.appendChild(draggingItem);
    } else {
      sortableContainer.insertBefore(draggingItem, afterElement);
    }
  });

  // Apply sorting on button click
  applySortingButton.addEventListener("click", () => {
    const currentOrder = Array.from(sortableContainer.children).map(
      (child) => child.textContent
    );
    const weights = getWeights();
    sortDataByFields(currentOrder, weights);
    displayTable(); // Update the table after sorting
  });
}

// Initialize weight inputs
function initWeightInputs() {
  weightInputsContainer.innerHTML = ""; // Clear existing inputs

  fields.forEach((field) => {
    const weightInput = document.createElement("div");
    weightInput.className = "weight-input";

    const label = document.createElement("label");
    label.textContent = `${field} Weight: `;
    label.setAttribute("for", `weight-${field}`);

    const input = document.createElement("input");
    input.type = "number";
    input.id = `weight-${field}`;
    input.name = field;
    input.value = 1; // Default weight

    weightInput.appendChild(label);
    weightInput.appendChild(input);
    weightInputsContainer.appendChild(weightInput);
  });
}

// Get weights from user input
function getWeights() {
  const weights = {};
  fields.forEach((field) => {
    const input = document.getElementById(`weight-${field}`);
    weights[field] = parseFloat(input.value) || 1; // Default to 1 if invalid
  });
  return weights;
}

// Sort data by user-selected field order and weights
function sortDataByFields(order, weights) {
  data.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    for (const field of order) {
      const valueA = parseValue(a[field]);
      const valueB = parseValue(b[field]);
      const weight = weights[field];

      scoreA += valueA * weight;
      scoreB += valueB * weight;
    }

    return scoreA - scoreB;
  });
}

// Helper to parse numeric values or leave as is
function parseValue(value) {
  // Check if the value is a number and return it directly
  if (typeof value === "number") {
    return value;
  }

  // If it's a string, parse numeric values or leave as is
  const num = parseFloat(value.replace(/[^0-9.-]/g, ""));
  return isNaN(num) ? 0 : num; // Default to 0 if not a number
}

// Helper to find the position of the dragged element
function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(".sortable-item:not(.dragging)"),
  ];

  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY }
  ).element;
}
