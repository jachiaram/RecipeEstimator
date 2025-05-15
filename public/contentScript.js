(() => {
    const html = document.documentElement.outerHTML;
    const ingredients = [];

	if(html.include("type=\"application/ld+json\"")) {
		const jsonText = html.split("type=\"application/ld+json\"")[1].split("</script>")[0];
		const match = jsonText.match(/"recipeIngredient"\s*:\s*[([^\]]+)\]/);
		if(match) {
			const rawIngredients = match[1].split("\"").filter(s => s.trim() && s !== ",");
			console.log(match[1]);
      console.log(Array.isArray(rawIngredients));
      if(Array.isArray(rawIngredients)) {
        ingredients.push(rawIngredients.map(ingredient => ({name: ingredient, price: 0.0})));
			  ingredients.push(...rawIngredients);
        }
		}
	} else {
    console.log("It isn't working :\(");
  }


    chrome.runtime.sendMessage({ action: "sendHTML", ingredients: ingredients});
  })();
  
