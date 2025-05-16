function getStandardDeviation(arr) {
  const n = arr.length;
  const mean = array.reduce((a,b) => a + b) / n;
  const variance = array.map(x => Math.pow(x - mean, 2)).reduce((a,b) => a + b) / n;
  return Math.sqrt(variance);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "FETCH_PRICES") {
    (async () => {
    try {
        let ingredients = message.ingredients; 
    const names = message.ingredients.map(ingredient => ingredient.name);
    const ll = message.ll;
    const shopping_url = "https://serpapi.com/search";
    const api_key = "6cd5f8f67243095eb46d38c9579e86ca5b2074636e6b236d906299e613b517ae";

    for (let i = 0; i < ingredients.length; i++) {
      try {
        const url = `${shopping_url}?engine=google_shopping&ll=${ll}&q=${encodeURIComponent(names[i])}&api_key=${api_key}&output=JSON`;
        const response = await fetch(url);
        const data = await response.json();
        const prices = data?.shopping_results?.map(item => item.extracted_price);
        ingredients[i].price = prices[0];
      } catch (error) {
        console.error("Error", error);
        ingredients[i].price = 0.0;
      }
    }
    console.log(ingredients);
    sendResponse({ ingredients });
      } catch(err) {
        console.error("It broke");
        sendResponse([]);
      }
    })();
  }
  return true;
});

