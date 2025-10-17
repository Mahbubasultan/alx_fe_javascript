// Local storage keys
const LOCAL_KEY_QUOTES = "quotesData";
const LOCAL_KEY_FILTER = "selectedCategory";

// Quotes array
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", category: "Happiness" },
];

// --- Step 1: Load & Save Quotes ---
function loadQuotes() {
  const storedQuotes = localStorage.getItem(LOCAL_KEY_QUOTES);
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

function saveQuotes() {
  localStorage.setItem(LOCAL_KEY_QUOTES, JSON.stringify(quotes));
}

// --- Step 2: Display Quotes ---
function showQuotes(filteredQuotes = quotes) {
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  if (filteredQuotes.length === 0) {
    quoteDisplay.innerHTML = "<p>No quotes found for this category.</p>";
    return;
  }

  filteredQuotes.forEach((q) => {
    const div = document.createElement("div");
    div.classList.add("quote-item");
    div.innerHTML = `<p>"${q.text}"</p><p class="category">— ${q.category}</p>`;
    quoteDisplay.appendChild(div);
  });
}

// --- Step 3: Create Add Quote Form ---
function createAddQuoteForm() {
  const form = document.createElement("div");
  form.innerHTML = `
    <input id="newQuoteText" type="text" placeholder="Enter a new quote" />
    <input id="newQuoteCategory" type="text" placeholder="Enter quote category" />
    <button id="addQuoteBtn">Add Quote</button>
  `;
  document.body.appendChild(form);

  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
}

// --- Step 4: Add New Quote ---
function addQuote() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newText && newCategory) {
    quotes.push({ text: newText, category: newCategory });
    saveQuotes();
    populateCategories(); // update category list dynamically
    alert("New quote added and saved!");
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  } else {
    alert("Please fill in both fields!");
  }
}

// --- Step 5: Populate Category Dropdown ---
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = ["all", ...new Set(quotes.map((q) => q.category))];

  categoryFilter.innerHTML = categories
    .map((cat) => `<option value="${cat}">${cat}</option>`)
    .join("");

  const savedFilter = localStorage.getItem(LOCAL_KEY_FILTER) || "all";
  categoryFilter.value = savedFilter;
}

// --- Step 6: Filter Quotes ---
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem(LOCAL_KEY_FILTER, selectedCategory);

  if (selectedCategory === "all") {
    showQuotes(quotes);
  } else {
    const filtered = quotes.filter((q) => q.category === selectedCategory);
    showQuotes(filtered);
  }
}

// --- Step 7: JSON Import/Export ---
function exportToJson() {
  const jsonData = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    filterQuotes();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// --- Step 8: Initialize ---
window.onload = () => {
  loadQuotes();

  // Create UI elements
  const controls = document.createElement("div");
  controls.innerHTML = `
    <h2>Dynamic Quote Generator</h2>
    <select id="categoryFilter" onchange="filterQuotes()">
      <option value="all">All Categories</option>
    </select>
    <div id="quoteDisplay"></div>
  `;
  document.body.appendChild(controls);

  createAddQuoteForm();

  // Export/Import section
  const jsonSection = document.createElement("div");
  jsonSection.innerHTML = `
    <br />
    <button id="exportBtn">Export Quotes (JSON)</button>
    <input type="file" id="importFile" accept=".json" onchange="importFromJsonFile(event)" />
  `;
  document.body.appendChild(jsonSection);

  // Add listeners
  document.getElementById("exportBtn").addEventListener("click", exportToJson);

  // Load categories & filter
  populateCategories();
  filterQuotes();
};
