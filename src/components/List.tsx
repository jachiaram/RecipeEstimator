interface Ingredient {
	name: string;
	price?: number;
}

interface ListProps {
	ingredients: Ingredient[];
}

export default function List({ ingredients }: ListProps) {
  const formatPrice = (price: number | undefined) => {
    if (price === undefined || price === 0.0) {
      return ""; // or "—" or "" depending on your preference
    } else {
      return `$${price.toFixed(2)}`;
    }
  };

  return (
    <ul>
      {Array.isArray(ingredients) && ingredients.length > 0 ? (
        ingredients.map((ingredient, index) => (
          <li key={index}>
            {ingredient.name}: {formatPrice(ingredient.price)}
          </li>
        ))
      ) : (
        <li>No ingredients found.</li>
      )}
    </ul>
  );
}
