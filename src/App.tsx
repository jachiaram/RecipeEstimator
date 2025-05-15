import axios from 'axios';
import React, { useState, useEffect } from 'react';
import './App.css';
import Button from './components/Button';
import List from './components/List';

function App() {
  const [ingredients, setIngredients] = useState<{ name: string; price: number }[]>([]);
  const [ll, setll] = useState<string>("");
  const [total, setTotal] = useState<number>(0);

  // get user location
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if(tabs[0].id) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => {
            return new Promise((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(
                pos => {
                  const coords = `${pos.coords.latitude},${pos.coords.longitude}`;
                  resolve(coords);
                },
                err => {
                  reject("Failed to get location");
                }
              );
            });
          }
        }).then((results) => {
          const coords = results[0]?.result;
          if(coords !== undefined && typeof coords === "string") {
              setll(coords);
          }
        }).catch((error) => {
          console.error('Error getting location:', error);
        });
      }
    });
  }, []);

  // scrape ingredients from webpage
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.scripting.executeScript(
          {
            target: { tabId: tabs[0].id },
            func: () => {
              const html = document.documentElement.outerHTML;

              if(html.includes("type=\"application/ld+json\"")) {
  	            const jsonText = html.split("type=\"application/ld+json\"")[1].split("</script>")[0];
  	            const match = jsonText.match(/"recipeIngredient"\s*:\s*(\[[^\]]*\])/);
  	            
                if(match) {
  		            const rawIngredients = match[1].split("\"").filter(s => s.trim() && s !== ",");
                
                  if(Array.isArray(rawIngredients)) {
                    rawIngredients.pop();
                    rawIngredients.shift();
                    return rawIngredients;
                  }
  	            }
              } else {
                 console.log("It isn't working :\(");
              }
              return [];
            }
          },
          (results) => {
            if (chrome.runtime.lastError) {
              console.error("Script error:", chrome.runtime.lastError.message);
              return;
            }

            const structured = results[0]?.result;
            if(structured !== undefined) {
              setIngredients(structured.map(ingredient => ({name: ingredient, price: 0.0})) || []);
            }
          }
        );
      }
    });
  }, []);

const fetchPrices = async (ingredients: { name: string; price: number }[], ll: string) => {
    return new Promise<{ ingredients: { name: string; price: number}[] }>((resolve, reject) => {
      chrome.runtime.sendMessage(
        {
          type: "FETCH_PRICES",
          ingredients: ingredients,
          ll: ll
        },
        (response) => {
          if (chrome.runtime.lastError) {
            console.error(response);
            console.error("Runtime error:", chrome.runtime.lastError.message);
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        }
      );
    });
  };

  const updatePrices = async () => {
  try {
    const response = await fetchPrices(ingredients, ll);
    const updatedIngredients = response.ingredients;
    if(Array.isArray(updatedIngredients)) {    
      let sum = 0.0;
      updatedIngredients.forEach(ing => {
        if (typeof ing.price === "number") {
          sum += ing.price;
        }
      });

      setIngredients(updatedIngredients);
      setTotal(parseFloat(sum.toFixed(2)));
      }
  } catch (err) {
    console.error("Failed to fetch prices", err);
  }
};

  //use api to get ingredient prices
//	const updatePrices = async (ingredients: {name: string, price: number}[]) => {
//  chrome.runtime.sendMessage(
//     {
//       type: "FETCH_PRICES",
//       ingredients: ingredients,
//       ll: ll
//     },
//     (response: {ingredients: {name: string, price: number}[]}) => {
//       if(chrome.runtime.lastError) {
//         console.error("Runtime error:", chrome.runtime.lastError.message);
//         alert(response);
//         return;
//       }
//       alert("got a response");
//       if(Array.isArray(response?.ingredients)) {
//         let sum = 0;
//         //sum prices
//         response.ingredients.forEach(ingredient => {
//           if(typeof ingredient.price === 'number') {
//             sum += ingredient.price;
//           }
//         });
//         alert(sum);          
//         //update prices on total and ingredients
//         setTotal(parseFloat(sum.toFixed(2)));
//         setIngredients(response.ingredients);
//       }
//     }
//   ); 
// };

return (
    <div className="App">
      <h1>List of ingredients:</h1>
      <Button title="Get Prices" onClick={async () => {updatePrices()}}/>
      <List ingredients={ingredients}/>
      <p>The total cost is: {total}</p>
    </div>
  );
}

export default App;
