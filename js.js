// Background script
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ businesses: [] }, () => {
      console.log('Initialized extension with empty list of businesses');
    });
  });
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'addBusiness') {
      chrome.storage.sync.get('businesses', (data) => {
        const businesses = data.businesses;
        businesses.push(request.payload);
        chrome.storage.sync.set({ businesses }, () => {
          console.log('Business added', request.payload);
          sendResponse({ message: 'success' });
        });
      });
    }
    return true;
  });
  
  // Content script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'scrape') {
      const product = document.querySelector('#product-title').textContent.trim(); // Get the current product title
      const location = request.location; // Get the location from the popup
      fetch(`https://api.example.com/businesses?product=${encodeURIComponent(product)}&location=${encodeURIComponent(location)}`)
        .then(response => response.json())
        .then(data => {
          const businesses = data.filter(business => business.product === product).slice(0, 5); // Get the first 5 businesses for the related product
          sendResponse({ businesses });
        })
        .catch(error => console.error(error));
      return true;
    }
  });
  
  // Popup script
  chrome.storage.sync.get('businesses', (data) => {
    const businesses = data.businesses;
    const list = document.querySelector('.business-list');
    businesses.forEach((business) => {
      const item = document.createElement('li');
      item.textContent = `${business.name} - ${business.address}`;
      list.appendChild(item);
    });
  });
  
  // API script
  const API_KEY = 'your-api-key';
  
  function getBusinesses(product, location) {
    const url = `https://api.your-api.com/businesses?product=${product}&location=${location}&apiKey=${API_KEY}`;
    return fetch(url)
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        return data.businesses;
      })
      .catch((error) => console.error(error));
  }
  