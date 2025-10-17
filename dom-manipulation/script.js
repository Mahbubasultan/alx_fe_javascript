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
  if (storedQuotes) quotes = JSON.parse(storedQuotes);
}

function saveQuotes() {
  localStorage.setItem(LOCAL_KEY_QUOTES, JSON.stringify(quotes));
}

// --- Step 2: Display Quotes ---
function showQuotes(filteredQuotes = quotes) {
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  if (filteredQuotes.length === 0) {
    const noQuoteMsg = document.createElement("p");
    noQuoteMsg.textContent = "No quotes found for this category.";
    quoteDisplay.appendChild(noQuoteMsg);
    return;
  }

  filteredQuotes.forEach((q) => {
    const div = document.createElement("div");
    div.classList.add("quote-item");

    const textP = document.createElement("p");
    textP.textContent = `"${q.text}"`;

    const catP = document.createElement("p");
    catP.classList.add("category");
    catP.textContent = `— ${q.category}`;

    div.appendChild(textP);
    div.appendChild(catP);
    quoteDisplay.appendChild(div);
  });
}

// --- Step 3: Create Add Quote Form ---
function createAddQuoteForm() {
  const form = document.createElement("div");

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addBtn = document.createElement("button");
  addBtn.id = "addQuoteBtn";
  addBtn.textContent = "Add Quote";

  form.appendChild(textInput);
  form.appendChild(categoryInput);
  form.appendChild(addBtn);
  document.body.appendChild(form);

  addBtn.addEventListener("click", addQuote);
}

// --- Step 4: Add New Quote ---
function addQuote() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newText && newCategory) {
    quotes.push({ text: newText, category: newCategory });
    saveQuotes();
    populateCategories();
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

  categoryFilter.innerHTML = "";
  categories.forEach((cat) => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const savedFilter = localStorage.getItem(LOCAL_KEY_FILTER) || "all";
  categoryFilter.value = savedFilter;
}

// --- Step 6: Filter Quotes ---
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem(LOCAL_KEY_FILTER, selectedCategory);

  const filtered =
    selectedCategory === "all"
      ? quotes
      : quotes.filter((q) => q.category === selectedCategory);

  showQuotes(filtered);
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

  const title = document.createElement("h2");
  title.textContent = "Dynamic Quote Generator";
  document.body.appendChild(title);

  const categoryFilter = document.createElement("select");
  categoryFilter.id = "categoryFilter";
  categoryFilter.addEventListener("change", filterQuotes);
  document.body.appendChild(categoryFilter);

  const quoteDisplay = document.createElement("div");
  quoteDisplay.id = "quoteDisplay";
  document.body.appendChild(quoteDisplay);

  createAddQuoteForm();

  const jsonSection = document.createElement("div");
  const exportBtn = document.createElement("button");
  exportBtn.id = "exportBtn";
  exportBtn.textContent = "Export Quotes (JSON)";
  exportBtn.addEventListener("click", exportToJson);

  const importInput = document.createElement("input");
  importInput.type = "file";
  importInput.id = "importFile";
  importInput.accept = ".json";
  importInput.addEventListener("change", importFromJsonFile);

  jsonSection.appendChild(exportBtn);
  jsonSection.appendChild(importInput);
  document.body.appendChild(jsonSection);

  populateCategories();
  filterQuotes();
};
