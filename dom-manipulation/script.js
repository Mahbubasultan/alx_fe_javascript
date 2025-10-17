// Quote database
    let quotes = [];
    let currentFilter = 'all';
    let lastSyncTimestamp = null;
    let pendingChanges = false;
    let syncInterval = 30000; // 30 seconds
    let syncInProgress = false;
    let conflicts = [];

    // DOM elements
    const quoteDisplay = document.getElementById('quoteDisplay');
    const newQuoteBtn = document.getElementById('newQuote');
    const categoryFilter = document.getElementById('categoryFilter');
    const resetFilterBtn = document.getElementById('resetFilter');
    const exportLink = document.getElementById('exportLink');
    const notification = document.getElementById('notification');
    const lastSyncTime = document.getElementById('lastSyncTime');
    const syncStatus = document.getElementById('syncStatus');
    const manualSyncBtn = document.getElementById('manualSync');
    const conflictModal = document.getElementById('conflictResolutionModal');
    const conflictsList = document.getElementById('conflictsList');

    // Initialize the app
    document.addEventListener('DOMContentLoaded', function() {
      loadQuotes();
      populateCategories();
      restoreFilter();
      
      // Set up event listeners
      newQuoteBtn.addEventListener('click', showRandomQuote);
      categoryFilter.addEventListener('change', filterQuotes);
      resetFilterBtn.addEventListener('click', resetFilter);
      manualSyncBtn.addEventListener('click', syncWithServer);
      
      // Load default quotes if storage is empty
      if (quotes.length === 0) {
        const defaultQuotes = [
          { text: "The only way to do great work is to love what you do.", category: "inspiration", id: generateId(), version: 1 },
          { text: "Innovation distinguishes between a leader and a follower.", category: "business", id: generateId(), version: 1 },
          { text: "Your time is limited, don't waste it living someone else's life.", category: "life", id: generateId(), version: 1 },
          { text: "Stay hungry, stay foolish.", category: "inspiration", id: generateId(), version: 1 },
          { text: "The journey of a thousand miles begins with one step.", category: "life", id: generateId(), version: 1 }
        ];
        quotes = defaultQuotes;
        saveQuotes();
        populateCategories();
      }
      
      // Set up periodic sync
      setInterval(syncWithServer, syncInterval);
    });

    // Generate unique ID for quotes
    function generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Show notification
    function showNotification(message, type = 'info') {
      notification.textContent = message;
      notification.style.display = 'block';
      notification.style.backgroundColor = type === 'error' ? '#ffdddd' : 
                                         type === 'success' ? '#ddffdd' : '#f8f9fa';
      setTimeout(() => {
        notification.style.display = 'none';
      }, 5000);
    }

    // Load quotes from local storage
    function loadQuotes() {
      const storedQuotes = localStorage.getItem('quotes');
      if (storedQuotes) {
        quotes = JSON.parse(storedQuotes);
      }
      const storedSync = localStorage.getItem('lastSync');
      if (storedSync) {
        lastSyncTimestamp = new Date(storedSync);
        lastSyncTime.textContent = lastSyncTimestamp.toLocaleString();
      }
    }

    // Save quotes to local storage
    function saveQuotes() {
      localStorage.setItem('quotes', JSON.stringify(quotes));
      localStorage.setItem('lastFilter', currentFilter);
      pendingChanges = true;
    }

    // Populate categories dropdown
    function populateCategories() {
      while (categoryFilter.options.length > 1) {
        categoryFilter.remove(1);
      }
      
      const categories = [...new Set(quotes.map(quote => quote.category))];
      
      categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category;
        option.textContent = category;
        categoryFilter.appendChild(option);
      });
    }

    // Filter quotes based on selected category
    function filterQuotes() {
      currentFilter = categoryFilter.value;
      saveQuotes();
      showRandomQuote();
    }

    // Restore last used filter from storage
    function restoreFilter() {
      const lastFilter = localStorage.getItem('lastFilter');
      if (lastFilter) {
        currentFilter = lastFilter;
        categoryFilter.value = lastFilter;
      }
    }

    // Reset filter to show all categories
    function resetFilter() {
      currentFilter = 'all';
      categoryFilter.value = 'all';
      saveQuotes();
      showRandomQuote();
    }

    // Display a random quote
    function showRandomQuote() {
      let filteredQuotes = quotes;
      
      if (currentFilter !== 'all') {
        filteredQuotes = quotes.filter(quote => quote.category === currentFilter);
      }
      
      if (filteredQuotes.length === 0) {
        const noQuotesMsg = currentFilter === 'all' 
          ? 'No quotes available. Add some new quotes!' 
          : No quotes found in the "${currentFilter}" category.;
        quoteDisplay.innerHTML = <p class="quote-text">${noQuotesMsg}</p>;
        return;
      }
      
      const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
      const quote = filteredQuotes[randomIndex];
      
      quoteDisplay.innerHTML = 
        <p class="quote-text">"${quote.text}"</p>
        <p class="quote-category">— ${quote.category}</p>
        <div>${getCategoryTags(quote.category)}</div>
      ;
    }

    // Generate category tags
    function getCategoryTags(category) {
      return <span class="category-tag">${category}</span>;
    }

    // Add a new quote
    function addQuote() {
      const textInput = document.getElementById('newQuoteText');
      const categoryInput = document.getElementById('newQuoteCategory');
      
      const text = textInput.value.trim();
      const category = categoryInput.value.trim().toLowerCase();
      
      if (!text || !category) {
        showNotification('Please enter both quote text and category', 'error');
        return;
      }
      
      const isDuplicate = quotes.some(quote => 
        quote.text.toLowerCase() === text.toLowerCase() && 
        quote.category.toLowerCase() === category.toLowerCase()
      );
      
      if (isDuplicate) {
        showNotification('This quote already exists in this category', 'error');
        return;
      }
      
      quotes.push({ 
        text, 
        category, 
        id: generateId(),
        version: 1,
        lastUpdated: new Date().toISOString()
      });
      textInput.value = '';
      categoryInput.value = '';
      
      saveQuotes();
      populateCategories();
      showRandomQuote();
      
      showNotification('Quote added successfully!', 'success');
    }

    // Export quotes to JSON file
    function exportToJson() {
      const dataStr = JSON.stringify(quotes, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      exportLink.href = URL.createObjectURL(dataBlob);
      exportLink.download = 'quotes.json';
      exportLink.click();
    }

    // Import quotes from JSON file
    function importFromJsonFile(event) {
      const file = event.target.files[0];
      if (!file) return;
      
      const fileReader = new FileReader();
      fileReader.onload = function(e) {
        try {
          const importedQuotes = JSON.parse(e.target.result);
          
          if (!Array.isArray(importedQuotes)) {
            throw new Error('Invalid format: Expected an array of quotes');
          }
          
          const validQuotes = importedQuotes.filter(quote => 
            quote.text && quote.category &&
            typeof quote.text === 'string' && 
            typeof quote.category === 'string'
          );
          
          if (validQuotes.length === 0) {
            throw new Error('No valid quotes found in the file');
          }
          
          // Add IDs and versions if missing
          const processedQuotes = validQuotes.map(quote => ({
            ...quote,
            id: quote.id || generateId(),
            version: quote.version || 1,
            lastUpdated: new Date().toISOString()
          }));
          
          quotes.push(...processedQuotes);
          saveQuotes();
          populateCategories();
          showRandomQuote();
          showNotification(Successfully imported ${validQuotes.length} quotes!, 'success');
          
          event.target.value = '';
        } catch (error) {
          showNotification(Error importing quotes: ${error.message}, 'error');
          console.error('Import error:', error);
        }
      };
      fileReader.readAsText(file);
    }

    // Clear all quotes from storage
    function clearLocalStorage() {
      if (confirm('Are you sure you want to clear all quotes? This cannot be undone.')) {
        localStorage.removeItem('quotes');
        localStorage.removeItem('lastFilter');
        quotes = [];
        populateCategories();
        quoteDisplay.innerHTML = '<p class="quote-text">No quotes available. Add some new quotes!</p>';
        currentFilter = 'all';
        categoryFilter.value = 'all';
        showNotification('All quotes have been cleared.', 'success');
      }
    }

    // Simulate server sync
    async function syncWithServer() {
      if (syncInProgress) return;
      
      syncInProgress = true;
      syncStatus.textContent = 'Syncing...';
      
      try {
        // Simulate server request delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // In a real app, this would be a fetch() call to your backend
        const serverQuotes = await simulateServerRequest();
        
        // Merge changes
        const mergeResult = mergeQuotes(quotes, serverQuotes);
        
        if (mergeResult.conflicts.length > 0) {
          conflicts = mergeResult.conflicts;
          showConflictResolution(mergeResult.conflicts);
        } else {
          quotes = mergeResult.mergedQuotes;
          saveQuotes();
          if (mergeResult.changesDetected) {
            populateCategories();
            showRandomQuote();
            showNotification('Data synced successfully with server', 'success');
          }
        }
        
        lastSyncTimestamp = new Date();
        lastSyncTime.textContent = lastSyncTimestamp.toLocaleString();
        localStorage.setItem('lastSync', lastSyncTimestamp.toISOString());
        pendingChanges = false;
      } catch (error) {
        console.error('Sync error:', error);
        showNotification('Error syncing with server', 'error');
      } finally {
        syncInProgress = false;
        syncStatus.textContent = '';
      }
    }

    // Simulate server request
    async function simulateServerRequest() {
      // In a real app, replace this with actual API call
      return new Promise((resolve) => {
        // Simulate server having some quotes
        const serverQuotes = [
          { 
            text: "The only way to do great work is to love what you do.", 
            category: "inspiration", 
            id: "insp1", 
            version: 2,
            lastUpdated: new Date(Date.now() - 3600000).toISOString()
          },
          { 
            text: "New server quote added remotely", 
            category: "business", 
            id: "bus1", 
            version: 1,
            lastUpdated: new Date().toISOString()
          },
          { 
            text: "Conflict example - this will differ from local", 
            category: "conflict", 
            id: "conf1", 
            version: 3,
            lastUpdated: new Date().toISOString()
          }
        ];
        
        // Randomly decide to return modified data or not
        setTimeout(() => {
          resolve(Math.random() > 0.3 ? serverQuotes : []);
        }, 500);
      });
    }

    // Merge local and server quotes
    function mergeQuotes(localQuotes, serverQuotes) {
      const mergedQuotes = [...localQuotes];
      const conflicts = [];
      let changesDetected = false;
      
      // Create map for quick lookup
      const localMap = new Map(localQuotes.map(q => [q.id, q]));
      
      // Process server quotes
      serverQuotes.forEach(serverQuote => {
        const localQuote = localMap.get(serverQuote.id);
        
        if (!localQuote) {
          // New quote from server
          mergedQuotes.push(serverQuote);
          changesDetected = true;
        } else {
          // Existing quote - check for conflicts
          if (serverQuote.version > localQuote.version) {
            // Server has newer version
            if (serverQuote.text !== localQuote.text || 
                serverQuote.category !== localQuote.category) {
              conflicts.push({
                id: serverQuote.id,
                local: localQuote,
                server: serverQuote
              });
            }
            changesDetected = true;
          }
        }
      });
      
      return {
        mergedQuotes,
        conflicts,
        changesDetected
      };
    }

    // Show conflict resolution UI
    function showConflictResolution(conflicts) {
      conflictsList.innerHTML = '';
      
      conflicts.forEach(conflict => {
        const conflictItem = document.createElement('div');
        conflictItem.className = 'conflict-item';
        conflictItem.innerHTML = 
          <h3>Quote ID: ${conflict.id}</h3>
          <div>
            <p><strong>Local Version:</strong> "${conflict.local.text}" (${conflict.local.category})</p>
            <p><strong>Server Version:</strong> "${conflict.server.text}" (${conflict.server.category})</p>
          </div>
        ;
        conflictsList.appendChild(conflictItem);
      });
      
      conflictModal.style.display = 'flex';
    }

    // Resolve conflicts
    function resolveConflicts(resolutionType) {
      conflictModal.style.display = 'none';
      
      conflicts.forEach(conflict => {
        const index = quotes.findIndex(q => q.id === conflict.id);
        
        if (index !== -1) {
          switch (resolutionType) {
            case 'server':
              // Use server version
              quotes[index] = conflict.server;
              break;
            case 'local':
              // Keep local version but update version to server's +1
              quotes[index].version = conflict.server.version + 1;
              quotes[index].lastUpdated = new Date().toISOString();
              break;
            case 'merge':
              // Merge strategy - in this case just keep both versions
              const mergedQuote = {
                ...quotes[index],
                text: ${quotes[index].text} (merged with: ${conflict.server.text}),
                version: Math.max(quotes[index].version, conflict.server.version) + 1,
                lastUpdated: new Date().toISOString()
              };
              quotes[index] = mergedQuote;
              break;
          }
        }
      });
      
      saveQuotes();
      populateCategories();
      showRandomQuote();
      showNotification(Conflicts resolved using ${resolutionType} version, 'success');
      conflicts = [];
    }
