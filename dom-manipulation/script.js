// Storage keys
const LOCAL_KEY_QUOTES = "quotesData";
const LOCAL_KEY_FILTER = "selectedCategory";
const SESSION_KEY_LAST_QUOTE = "lastViewedQuote";

// Default quotes
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
  { text: "Success is not the key to happiness. Happiness is the key to success.", category: "Happiness" },
];

// --- Load & Save Quotes ---
function loadQuotes() {
  const storedQuotes = localStorage.getItem(LOCAL_KEY_QUOTES);
  if (storedQuotes) quotes = JSON.parse(storedQuotes);
}

function saveQuotes() {
  localStorage.setItem(LOCAL_KEY_QUOTES, JSON.stringify(quotes));
}

// --- Show Random Quote ---
function showRandomQuote() {
  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  if (quotes.length === 0) {
    const msg = document.createElement("p");
    msg.textContent = "No quotes available.";
    quoteDisplay.appendChild(msg);
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];

  const textEl = document.createElement("p");
  textEl.textContent = `"${quote.text}"`;

  const catEl = document.createElement("p");
  catEl.classList.add("category");
  catEl.textContent = `— ${quote.category}`;

  quoteDisplay.appendChild(textEl);
  quoteDisplay.appendChild(catEl);

  sessionStorage.setItem(SESSION_KEY_LAST_QUOTE, randomIndex);
}

// --- Create Add Quote Form dynamically ---
function createAddQuoteForm() {
  const formDiv = document.createElement("div");

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
  addBtn.addEventListener("click", addQuote);

  formDiv.appendChild(textInput);
  formDiv.appendChild(categoryInput);
  formDiv.appendChild(addBtn);

  document.body.insertBefore(formDiv, document.getElementById("quoteDisplay"));
}

// --- Add New Quote ---
function addQuote() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newText && newCategory) {
    quotes.push({ text: newText, category: newCategory });
    saveQuotes();
    populateCategories();
    filterQuotes();
    alert("New quote added!");
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  } else {
    alert("Please fill in both fields!");
  }
}

// --- Populate categories dynamically ---
function populateCategories() {
  const categoryFilter = document.getElementById("categoryFilter");
  const categories = ["all", ...new Set(quotes.map(q => q.category))];

  categoryFilter.innerHTML = "";
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const savedFilter = localStorage.getItem(LOCAL_KEY_FILTER) || "all";
  categoryFilter.value = savedFilter;
}

// --- Filter Quotes ---
function filterQuotes() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  localStorage.setItem(LOCAL_KEY_FILTER, selectedCategory);

  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  const quoteDisplay = document.getElementById("quoteDisplay");
  quoteDisplay.innerHTML = "";

  if (filtered.length === 0) {
    const msg = document.createElement("p");
    msg.textContent = "No quotes found for this category.";
    quoteDisplay.appendChild(msg);
    return;
  }

  filtered.forEach(quote => {
    const div = document.createElement("div");
    div.classList.add("quote-item");

    const textP = document.createElement("p");
    textP.textContent = `"${quote.text}"`;

    const catP = document.createElement("p");
    catP.classList.add("category");
    catP.textContent = `— ${quote.category}`;

    div.appendChild(textP);
    div.appendChild(catP);
    quoteDisplay.appendChild(div);
  });
}

// --- JSON Import/Export ---
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
  fileReader.onload = function(e) {
    const importedQuotes = JSON.parse(e.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    filterQuotes();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

// --- Initialize ---
window.onload = () => {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();
  filterQuotes();

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  document.getElementById("categoryFilter").addEventListener("change", filterQuotes);
  document.getElementById("exportBtn").addEventListener("click", exportToJson);

  // Show last viewed quote if exists
  const lastIndex = sessionStorage.getItem(SESSION_KEY_LAST_QUOTE);
  if (lastIndex && quotes[lastIndex]) {
    const quoteDisplay = document.getElementById("quoteDisplay");
    const textEl = document.createElement("p");
    textEl.textContent = `"${quotes[lastIndex].text}"`;
    const catEl = document.createElement("p");
    catEl.classList.add("category");
    catEl.textContent = `— ${quotes[lastIndex].category}`;
    quoteDisplay.appendChild(textEl);
    quoteDisplay.appendChild(catEl);
  }
};
// --- Task 3: Fetch quotes from server ---
async function fetchQuotesFromServer() {
  try {
    // Example using JSONPlaceholder or any mock API
    const response = await fetch("https://jsonplaceholder.typicode.com/posts"); 
    if (!response.ok) throw new Error("Failed to fetch server data");

    const data = await response.json();

    // Transform mock data to quote objects (text + category)
    const serverQuotes = data.slice(0, 5).map(item => ({
      text: item.title,
      category: "Server Quote"
    }));

    // Merge server quotes with local quotes (server takes precedence)
    const combinedQuotes = [...serverQuotes];

    // Keep local quotes that are not duplicates
    quotes.forEach(localQuote => {
      if (!combinedQuotes.some(q => q.text === localQuote.text)) {
        combinedQuotes.push(localQuote);
      }
    });

    quotes = combinedQuotes;
    saveQuotes();
    populateCategories();
    filterQuotes();
    console.log("Server quotes synced successfully!");
  } catch (err) {
    console.error("Error fetching server quotes:", err);
  }
}

// --- Optional: periodic sync every 60 seconds ---
setInterval(fetchQuotesFromServer, 60000);
// --- Task 3: Send new quote to server ---
async function sendQuoteToServer(quote) {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(quote)
    });

    if (!response.ok) throw new Error("Failed to send quote to server");

    const serverData = await response.json();
    console.log("Quote successfully sent to server:", serverData);
  } catch (err) {
    console.error("Error sending quote to server:", err);
  }
}

// --- Modify addQuote() to send new quote to server ---
function addQuote() {
  const newText = document.getElementById("newQuoteText").value.trim();
  const newCategory = document.getElementById("newQuoteCategory").value.trim();

  if (newText && newCategory) {
    const newQuote = { text: newText, category: newCategory };
    quotes.push(newQuote);
    saveQuotes();
    populateCategories();
    filterQuotes();
    sendQuoteToServer(newQuote); // <--- send to server
    alert("New quote added!");
    document.getElementById("newQuoteText").value = "";
    document.getElementById("newQuoteCategory").value = "";
  } else {
    alert("Please fill in both fields!");
  }
}
