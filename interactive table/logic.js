// Path to the CSV file
const csvFilePath = "master_data.csv";

// Fetch the CSV data and convert to an array of objects
fetch(csvFilePath)
  .then((response) => response.text())
  .then((csvText) => {
    const data = csvToArray(csvText);
    createTable(data);
  })
  .catch((error) => console.error("Error fetching the CSV data:", error));

// Convert CSV text to an array of objects using PapaParse
function csvToArray(csvText) {
  const parsedData = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
  });
  return parsedData.data;
}

// Columns to exclude
const excludedColumns = [
  "Average Annual Premium",
  "Average Annual Food Cost",
  "Average Annual Housing Cost",
];

// Create table from the CSV data
function createTable(data) {
  const tableHead = document.getElementById("table-head");
  const tableBody = document.getElementById("table-body");

  // Filter headers to exclude specified columns
  const headers = Object.keys(data[0]).filter(
    (header) => !excludedColumns.includes(header)
  );

  // Create header
  const headerRow = document.createElement("tr");
  headers.forEach((header, index) => {
    const th = document.createElement("th");
    th.textContent = header;
    th.dataset.column = index;
    th.addEventListener("click", () => sortTable(index));
    headerRow.appendChild(th);
  });
  tableHead.appendChild(headerRow);

  // Create body
  data.forEach((row) => {
    const tr = document.createElement("tr");
    headers.forEach((header) => {
      const td = document.createElement("td");
      td.textContent = row[header];
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
}

// Sort table by column index
let sortOrder = 1;
function sortTable(columnIndex) {
  const tableBody = document.getElementById("table-body");
  const rows = Array.from(tableBody.querySelectorAll("tr"));
  rows.sort((a, b) => {
    const aText = a
      .querySelector(`td:nth-child(${columnIndex + 1})`)
      .textContent.replace(/[$,]/g, "");
    const bText = b
      .querySelector(`td:nth-child(${columnIndex + 1})`)
      .textContent.replace(/[$,]/g, "");
    if (!isNaN(aText) && !isNaN(bText)) {
      return (parseFloat(aText) - parseFloat(bText)) * sortOrder;
    } else {
      return aText.localeCompare(bText) * sortOrder;
    }
  });
  tableBody.innerHTML = "";
  rows.forEach((row) => tableBody.appendChild(row));
  sortOrder = -sortOrder;
  updateHeaderSortIndicators(columnIndex);
}

// Update sort indicators on headers
function updateHeaderSortIndicators(columnIndex) {
  const headers = document.querySelectorAll("th");
  headers.forEach((header, index) => {
    header.classList.remove("sorted-asc", "sorted-desc");
    if (index === columnIndex) {
      header.classList.add(sortOrder === 1 ? "sorted-asc" : "sorted-desc");
    }
  });
}
