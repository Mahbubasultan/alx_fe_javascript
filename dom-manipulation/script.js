// Local storage key
const LOCAL_KEY = "quotesData";

// Default quotes
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", category: "Happiness" },
];

// Load existing quotes from localStorage if available
function loadQuotes() {
  const storedQuotes = localStorage.getItem(LOCAL_KEY);
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(quotes));
}

// Display random quote
function showRandomQuote() {
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const randomQuote = quotes[randomIndex];
  document.getElementById("quoteDisplay").innerHTML = `
    <p>"${randomQuote.text}"</p>
    <p class="category">— ${randomQuote.category}</p>
  `;

  // Save last viewed index in sessionStorage
  sessionStorage.setItem("lastViewedIndex", randomIndex);
}

// Add new quote
function addQuote() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newText && newCategory) {
    quotes.push({ text: newText, category: newCategory });
    saveQuotes(); // Save to localStorage
    alert("New quote added and saved!");
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  } else {
    alert("Please fill out both fields.");
  }
}

// Export quotes to JSON file
function exportToJson() {
  const jsonData = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Import quotes from JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// Initialize
window.onload = () => {
  loadQuotes();
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("addQuoteBtn").addEventListener("click", addQuote);
  document.getElementById("exportBtn").addEventListener("click", exportToJson);

  // Restore last viewed quote
  const lastIndex = sessionStorage.getItem("lastViewedIndex");
  if (lastIndex !== null && quotes[lastIndex]) {
    const lastQuote = quotes[lastIndex];
    document.getElementById("quoteDisplay").innerHTML = `
      <p>"${lastQuote.text}"</p>
      <p class="category">— ${lastQuote.category}</p>
    `;
  }
};
