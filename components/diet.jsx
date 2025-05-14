"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

//import "./Diet.css"
export const Diet=()=> {
  const router = useRouter();

  const [calorieInput, setCalorieInput] = useState('');
  const [dietType, setDietType] = useState('veg');
  const [dietPlan, setDietPlan] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Available calorie ranges for diet planss
  const calorieRanges = [
    { min: 1000, max: 1300, label: "1000-1300" },
    { min: 1300, max: 1500, label: "1300-1500" },
    { min: 1500, max: 1800, label: "1500-1800" },
    { min: 1800, max: 2100, label: "1800-2100" },
    { min: 2100, max: 2400, label: "2100-2400" }
  ];

  const dietData = {
    '1000-1300': {
      veg: [
        { breakfast: "Oats with almond milk", lunch: "Grilled veggie wrap", dinner: "Tofu stir fry with quinoa" },
        { breakfast: "Vegetable poha", lunch: "Chickpea salad", dinner: "Paneer bhurji with chapati" },
        { breakfast: "Smoothie bowl", lunch: "Rajma rice", dinner: "Mixed veg curry and rice" },
        { breakfast: "Sprouts salad", lunch: "Vegetable biryani", dinner: "Dal with brown rice" },
        { breakfast: "Multigrain toast and peanut butter", lunch: "Grilled vegetables", dinner: "Sambar with idli" }
      ],
      'non-veg': [
        { breakfast: "Boiled eggs and toast", lunch: "Chicken salad", dinner: "Grilled fish with veggies" },
        { breakfast: "Omelette with veggies", lunch: "Grilled chicken sandwich", dinner: "Chicken curry and rice" },
        { breakfast: "Greek yogurt and fruits", lunch: "Chicken tikka wrap", dinner: "Fish curry with brown rice" },
        { breakfast: "Egg sandwich", lunch: "Chicken Caesar salad", dinner: "Tandoori chicken with naan" },
        { breakfast: "Protein smoothie", lunch: "Chicken quinoa bowl", dinner: "Grilled shrimp with salad" }
      ],
      vegan: [
        { breakfast: "Chia seed pudding", lunch: "Vegan burrito", dinner: "Lentil soup with quinoa" },
        { breakfast: "Smoothie with plant milk", lunch: "Vegan Buddha bowl", dinner: "Stuffed peppers" },
        { breakfast: "Vegan pancakes", lunch: "Tofu wrap", dinner: "Black bean curry with rice" },
        { breakfast: "Fruit salad and nuts", lunch: "Hummus sandwich", dinner: "Grilled tofu and veggies" },
        { breakfast: "Overnight oats", lunch: "Lentil salad", dinner: "Vegan pasta" }
      ],
      keto: [
        { breakfast: "Avocado smoothie", lunch: "Chicken lettuce wraps", dinner: "Grilled salmon and asparagus" },
        { breakfast: "Keto pancakes", lunch: "Zucchini noodles with pesto", dinner: "Beef steak and salad" },
        { breakfast: "Scrambled eggs and avocado", lunch: "Cauliflower rice bowl", dinner: "Chicken thighs with veggies" },
        { breakfast: "Keto chia pudding", lunch: "Bunless burger", dinner: "Grilled turkey with spinach" },
        { breakfast: "Almond flour muffins", lunch: "Egg salad", dinner: "Grilled chicken wings" }
      ],
      anything: [
        { breakfast: "Anything: Bread + Butter", lunch: "Anything: Pasta or Biriyani", dinner: "Anything: Burger or Pizza" },
        { breakfast: "Anything: Cereal or Toast", lunch: "Anything: Rice or Roti", dinner: "Anything: Sandwich or Wrap" },
        { breakfast: "Anything: Fruit Bowl", lunch: "Anything: Fast Food", dinner: "Anything: Dal and Rice" },
        { breakfast: "Anything: Waffles", lunch: "Anything: Dumplings", dinner: "Anything: Chicken Fry" },
        { breakfast: "Anything: Paratha", lunch: "Anything: Shawarma", dinner: "Anything: Ice cream" }
      ]
    },
    '1300-1500': {
        veg: [
          { breakfast: "Oats and fruit", lunch: "Grilled vegetable sandwich", dinner: "Paneer with roti" },
          { breakfast: "Vegetable poha", lunch: "Dal khichdi", dinner: "Chana masala with rice" },
          { breakfast: "Smoothie bowl", lunch: "Stuffed paratha", dinner: "Mixed veg curry" },
          { breakfast: "Muesli with milk", lunch: "Vegetable upma", dinner: "Sambar with dosa" },
          { breakfast: "Sprouts salad", lunch: "Curd rice", dinner: "Vegetable stew and appam" }
        ],
        'non-veg': [
          { breakfast: "Egg sandwich", lunch: "Grilled chicken wrap", dinner: "Fish curry and rice" },
          { breakfast: "Omelette and toast", lunch: "Chicken fried rice", dinner: "Shrimp stir fry" },
          { breakfast: "Boiled eggs", lunch: "Chicken salad", dinner: "Mutton curry and roti" },
          { breakfast: "Greek yogurt with fruits", lunch: "Tuna sandwich", dinner: "Chicken stew" },
          { breakfast: "Eggs and veggies", lunch: "Turkey wrap", dinner: "Grilled fish and quinoa" }
        ],
        vegan: [
          { breakfast: "Chia pudding", lunch: "Tofu stir fry", dinner: "Lentil curry with rice" },
          { breakfast: "Banana smoothie", lunch: "Vegan pasta", dinner: "Chickpea curry" },
          { breakfast: "Fruit salad", lunch: "Vegan sandwich", dinner: "Black bean stew" },
          { breakfast: "Oats with almond milk", lunch: "Vegan wrap", dinner: "Stuffed sweet potatoes" },
          { breakfast: "Smoothie bowl", lunch: "Lentil salad", dinner: "Vegan tacos" }
        ],
        keto: [
          { breakfast: "Avocado eggs", lunch: "Chicken salad", dinner: "Grilled fish with greens" },
          { breakfast: "Scrambled eggs", lunch: "Keto zucchini noodles", dinner: "Beef steak" },
          { breakfast: "Bulletproof coffee", lunch: "Chicken lettuce wrap", dinner: "Pork chops" },
          { breakfast: "Coconut yogurt", lunch: "Keto burger", dinner: "Grilled turkey" },
          { breakfast: "Keto pancakes", lunch: "Egg salad", dinner: "Grilled chicken thighs" }
        ],
        anything: [
          { breakfast: "Bread and jam", lunch: "Pasta", dinner: "Pizza" },
          { breakfast: "Toast", lunch: "Rice and curry", dinner: "Sandwich" },
          { breakfast: "Fruit Bowl", lunch: "Shawarma", dinner: "Burger" },
          { breakfast: "Cereal", lunch: "Dumplings", dinner: "Fried Chicken" },
          { breakfast: "Paratha", lunch: "Kebabs", dinner: "Ice cream" }
        ]
      },

      '1500-1800': {
  veg: [
    { breakfast: "Peanut butter toast", lunch: "Rajma chawal", dinner: "Vegetable biryani" },
    { breakfast: "Vegetable sandwich", lunch: "Paneer tikka", dinner: "Mix veg sabzi with roti" },
    { breakfast: "Upma with veggies", lunch: "Dal fry and jeera rice", dinner: "Palak paneer" },
    { breakfast: "Fruit smoothie", lunch: "Chana salad", dinner: "Aloo gobi" },
    { breakfast: "Multigrain porridge", lunch: "Stuffed paratha with veggies", dinner: "Kofta curry with 1/2 cup rice" },
    { breakfast: "Idli with sambhar", lunch: "Vegetable pulao", dinner: "Bhindi masala" },
    { breakfast: "Besan chilla", lunch: "Matar paneer with roti", dinner: "Mixed dal and brown rice" },
    { breakfast: "Dhokla", lunch: "Vegetable khichdi", dinner: "Methi aloo with chapati" },
    { breakfast: "Moong dal cheela", lunch: "Soya chunks curry", dinner: "Baingan bharta" },
    { breakfast: "Vegetable oats", lunch: "Corn and capsicum sandwich", dinner: "Dum aloo with jeera rice" }
  ],
  'non-veg': [
    { breakfast: "Scrambled eggs and veggies", lunch: "Chicken biryani", dinner: "Grilled shrimp" },
    { breakfast: "Boiled eggs", lunch: "Fish curry with 1 cup rice", dinner: "Chicken curry & 1 ruti" },
    { breakfast: "Yogurt parfait", lunch: "Chicken curry with 1 cup rice", dinner: "Grilled lamb" },
    { breakfast: "Egg toast", lunch: "Grilled turkey sandwich", dinner: "Fried fish" },
    { breakfast: "Protein shake", lunch: "BBQ chicken wrap", dinner: "Vegetables and chapati" },
    { breakfast: "Chicken sausage with toast", lunch: "Grilled salmon", dinner: "Chicken stew" },
    { breakfast: "Egg bhurji", lunch: "Butter chicken with naan", dinner: "Grilled prawns" },
    { breakfast: "Omelette with mushrooms", lunch: "Chicken shawarma plate", dinner: "Spicy fish fry" },
    { breakfast: "Turkey bacon strips", lunch: "Tuna salad", dinner: "Beef curry with chapati" },
    { breakfast: "Smoked salmon bagel", lunch: "Chicken Caesar salad", dinner: "Roast chicken and veggies" }
  ],
  vegan: [
    { breakfast: "Vegan protein smoothie", lunch: "Quinoa salad", dinner: "Tofu curry" },
    { breakfast: "Banana oats", lunch: "Chickpea bowl", dinner: "Jackfruit biryani" },
    { breakfast: "Fruit bowl", lunch: "Lentil burger", dinner: "Vegan stir fry" },
    { breakfast: "Granola and almond milk", lunch: "Vegan rice bowl", dinner: "Plant-based curry" },
    { breakfast: "Chia seed pudding", lunch: "Vegan burrito", dinner: "Stuffed bell peppers" },
    { breakfast: "Peanut butter oatmeal", lunch: "Vegan pasta", dinner: "Grilled tempeh" },
    { breakfast: "Tofu scramble", lunch: "Vegan ramen", dinner: "Roasted vegetable curry" },
    { breakfast: "Vegan yogurt with fruits", lunch: "Hummus and veggie wrap", dinner: "Chickpea stew" },
    { breakfast: "Vegan pancakes", lunch: "Tofu salad", dinner: "Zucchini noodles with marinara" },
    { breakfast: "Smoothie bowl with seeds", lunch: "Sweet potato bowl", dinner: "Mushroom stroganoff" }
  ],
  keto: [
    { breakfast: "Keto smoothie", lunch: "Chicken zoodles", dinner: "Beef steak" },
    { breakfast: "Almond flour bread", lunch: "Bunless burger", dinner: "Keto salmon" },
    { breakfast: "Bulletproof coffee", lunch: "Keto wrap", dinner: "Pork roast" },
    { breakfast: "Scrambled eggs", lunch: "Zucchini pasta", dinner: "Grilled chicken" },
    { breakfast: "Avocado salad", lunch: "Keto beef salad", dinner: "Shrimp skewers" },
    { breakfast: "Cream cheese pancakes", lunch: "Keto chicken curry", dinner: "Garlic butter shrimp" },
    { breakfast: "Cottage cheese bowl", lunch: "Keto taco salad", dinner: "Grilled steak with herb butter" },
    { breakfast: "Bacon and eggs", lunch: "Chicken lettuce wraps", dinner: "Keto lamb chops" },
    { breakfast: "Avocado smoothie", lunch: "Zucchini lasagna", dinner: "Baked salmon with broccoli" },
    { breakfast: "Cheese omelette", lunch: "Keto chicken alfredo", dinner: "Grilled sausage and peppers" }
  ],
  anything: [
    { breakfast: "Cornflakes", lunch: "Baked chicken", dinner: "Pasta" },
    { breakfast: "Toast and butter", lunch: "Rice bowl", dinner: "Shawarma" },
    { breakfast: "Pancakes", lunch: "Pizza", dinner: "Chicken wings" },
    { breakfast: "Croissant", lunch: "Sushi", dinner: "Steak" },
    { breakfast: "Waffles", lunch: "Dumplings", dinner: "Kebab" },
    { breakfast: "Chocolate chip muffin", lunch: "Fried rice", dinner: "Cheeseburger" },
    { breakfast: "Bagel with cream cheese", lunch: "Chicken nuggets", dinner: "Grilled ribs" },
    { breakfast: "Fruit loops cereal", lunch: "Hotdog", dinner: "Prawn tempura" },
    { breakfast: "French toast", lunch: "Nachos with cheese", dinner: "BBQ chicken pizza" },
    { breakfast: "Smoothie and donut", lunch: "Taco bowl", dinner: "Fajitas" }
  ]
},
'1800-2100': {
  veg: [
    { breakfast: "Vegetable poha", lunch: "Chole bhature", dinner: "Paneer butter masala with naan" },
    { breakfast: "Masala dosa with sambhar", lunch: "Veg fried rice", dinner: "Kadhai paneer" },
    { breakfast: "Paratha with curd", lunch: "Stuffed capsicum and rice", dinner: "Vegetable korma" },
    { breakfast: "Oats chilla", lunch: "Soya biryani", dinner: "Mixed vegetable curry with roti" },
    { breakfast: "Fruit and nut yogurt", lunch: "Pav bhaji", dinner: "Methi matar malai with chapati" },
    { breakfast: "Multigrain toast with hummus", lunch: "Vegetable pasta", dinner: "Rajma with jeera rice" },
    { breakfast: "Moong dal dosa", lunch: "Chana masala with roti", dinner: "Aloo matar" },
    { breakfast: "Vegetable upma", lunch: "Spinach and corn sandwich", dinner: "Kofta curry" },
    { breakfast: "Idli with coconut chutney", lunch: "Vegetable hakka noodles", dinner: "Baingan bharta with paratha" },
    { breakfast: "Smoothie bowl with seeds", lunch: "Veg burrito", dinner: "Stuffed paratha with curd" }
  ],
  'non-veg': [
    { breakfast: "Boiled eggs and toast", lunch: "Chicken fried rice", dinner: "Butter chicken with naan" },
    { breakfast: "Chicken sausage sandwich", lunch: "Fish curry with rice", dinner: "Grilled chicken and veggies" },
    { breakfast: "Omelette with spinach", lunch: "Prawn biryani", dinner: "Mutton curry with chapati" },
    { breakfast: "Greek yogurt with nuts", lunch: "Grilled fish and salad", dinner: "Chicken korma with rice" },
    { breakfast: "Chicken salad wrap", lunch: "Chicken shawarma bowl", dinner: "Spicy beef fry with paratha" },
    { breakfast: "Scrambled eggs", lunch: "Chicken Caesar salad", dinner: "Roasted turkey and vegetables" },
    { breakfast: "Tuna sandwich", lunch: "Grilled chicken wrap", dinner: "BBQ fish platter" },
    { breakfast: "Smoked salmon toast", lunch: "Butter garlic prawns with rice", dinner: "Chicken stew and bread" },
    { breakfast: "Egg and veggie scramble", lunch: "Fish tacos", dinner: "Grilled lamb chops" },
    { breakfast: "Turkey and avocado toast", lunch: "Chicken pizza", dinner: "Stuffed fish fillet" }
  ],
  vegan: [
    { breakfast: "Vegan banana pancakes", lunch: "Chickpea curry with rice", dinner: "Tofu stir fry" },
    { breakfast: "Almond milk smoothie", lunch: "Vegan quinoa bowl", dinner: "Stuffed zucchini boats" },
    { breakfast: "Peanut butter banana toast", lunch: "Vegan pad thai", dinner: "Jackfruit tacos" },
    { breakfast: "Granola with plant milk", lunch: "Veggie-loaded burrito", dinner: "Mushroom risotto" },
    { breakfast: "Chia pudding with fruits", lunch: "Vegan Buddha bowl", dinner: "Lentil shepherd's pie" },
    { breakfast: "Tofu scramble", lunch: "Sweet potato curry", dinner: "Cauliflower tikka masala" },
    { breakfast: "Oats and almond milk", lunch: "Tempeh wrap", dinner: "Stuffed bell peppers" },
    { breakfast: "Vegan yogurt parfait", lunch: "Rice and black beans", dinner: "Coconut curry tofu" },
    { breakfast: "Smoothie with flax seeds", lunch: "Pasta primavera (vegan)", dinner: "Vegan chili" },
    { breakfast: "Plant-based protein shake", lunch: "Vegan sushi rolls", dinner: "Spicy vegan noodles" }
  ],
  keto: [
    { breakfast: "Egg muffins", lunch: "Keto chicken stir fry", dinner: "Grilled salmon with asparagus" },
    { breakfast: "Bulletproof coffee and nuts", lunch: "Zucchini noodle salad", dinner: "Steak with garlic butter" },
    { breakfast: "Cheese omelette", lunch: "Lettuce wrapped burger", dinner: "Chicken alfredo with zoodles" },
    { breakfast: "Avocado and boiled eggs", lunch: "Keto taco bowl", dinner: "Pork chops" },
    { breakfast: "Low-carb smoothie", lunch: "Shrimp salad", dinner: "Grilled chicken thighs" },
    { breakfast: "Almond flour pancakes", lunch: "Keto tuna salad", dinner: "Beef kebabs" },
    { breakfast: "Coconut yogurt", lunch: "Chicken stuffed peppers", dinner: "Keto lamb curry" },
    { breakfast: "Keto chaffles", lunch: "Buffalo chicken wings", dinner: "Stuffed zucchini boats" },
    { breakfast: "Mozzarella omelette", lunch: "Egg salad wrap", dinner: "Keto baked cod" },
    { breakfast: "Scrambled eggs with avocado", lunch: "Keto burrito bowl", dinner: "Crispy roasted chicken" }
  ],
  anything: [
    { breakfast: "Pancakes with maple syrup", lunch: "Cheeseburger", dinner: "Pizza" },
    { breakfast: "French toast", lunch: "Chicken nuggets with fries", dinner: "Pasta with Alfredo sauce" },
    { breakfast: "Breakfast burrito", lunch: "Tacos", dinner: "Beef steak with mashed potatoes" },
    { breakfast: "Bagel and cream cheese", lunch: "Burrito bowl", dinner: "Shawarma platter" },
    { breakfast: "Fruit salad and muffin", lunch: "Sushi rolls", dinner: "Grilled chicken wings" },
    { breakfast: "Chocolate croissant", lunch: "Fried rice and chili chicken", dinner: "Lasagna" },
    { breakfast: "Cereal and milk", lunch: "Loaded nachos", dinner: "BBQ ribs" },
    { breakfast: "Waffle with whipped cream", lunch: "Mac and cheese", dinner: "Tandoori chicken" },
    { breakfast: "Omelette sandwich", lunch: "Hotdog with fries", dinner: "Butter chicken" },
    { breakfast: "Smoothie and donuts", lunch: "Ramen noodles", dinner: "Kebab platter" }
  ]
},


      '2100-2400': {
        veg: [
          { breakfast: "Vegetable oats", lunch: "Vegetable pulao", dinner: "Dal makhani with rice" },
          { breakfast: "Smoothie and toast", lunch: "Chole bhature", dinner: "Paneer butter masala" },
          { breakfast: "Poha and peanuts", lunch: "Veg biryani", dinner: "Mix veg and paratha" },
          { breakfast: "Sprouts salad", lunch: "Curd rice", dinner: "Stuffed paratha" },
          { breakfast: "Fruit bowl", lunch: "Rajma chawal", dinner: "Palak paneer" }
        ],
        // Similarly fill non-veg, vegan, keto, anything...
      },

      '2400-2700': {
        veg: [
          { breakfast: "Avocado toast and smoothie", lunch: "Vegetable pasta", dinner: "Paneer curry with brown rice" },
          { breakfast: "Masala dosa with sambhar", lunch: "Veg biryani", dinner: "Dal makhani and naan" },
          { breakfast: "Fruit and nut oatmeal", lunch: "Chickpea curry and rice", dinner: "Stuffed bell peppers" },
          { breakfast: "Multigrain pancakes", lunch: "Vegetable lasagna", dinner: "Palak paneer with roti" },
          { breakfast: "Poha with peanuts", lunch: "Rajma chawal", dinner: "Mix veg curry with jeera rice" }
        ],
        'non-veg': [
          { breakfast: "Omelette and toast", lunch: "Chicken biryani", dinner: "Grilled fish with mashed potatoes" },
          { breakfast: "Scrambled eggs with spinach", lunch: "Butter chicken and naan", dinner: "Fish curry and rice" },
          { breakfast: "Yogurt and fruits", lunch: "Chicken fried rice", dinner: "Roasted lamb with veggies" },
          { breakfast: "Protein shake and nuts", lunch: "Mutton curry and paratha", dinner: "Grilled prawns and salad" },
          { breakfast: "Egg bhurji with paratha", lunch: "Chicken pasta", dinner: "Baked fish with asparagus" }
        ],
        vegan: [
          { breakfast: "Smoothie with almond milk", lunch: "Vegan pasta", dinner: "Stuffed eggplant and couscous" },
          { breakfast: "Vegan granola bar", lunch: "Chickpea salad", dinner: "Vegan stir fry and rice" },
          { breakfast: "Vegan banana pancakes", lunch: "Grilled tofu sandwich", dinner: "Vegan lasagna" },
          { breakfast: "Overnight oats", lunch: "Lentil wrap", dinner: "Jackfruit curry and rice" },
          { breakfast: "Fruit salad and nuts", lunch: "Tofu poke bowl", dinner: "Vegan tacos" }
        ],
        keto: [
          { breakfast: "Avocado eggs", lunch: "Zucchini noodles with meatballs", dinner: "Grilled salmon with broccoli" },
          { breakfast: "Keto omelette", lunch: "Chicken zoodle soup", dinner: "Pork chops with cauliflower mash" },
          { breakfast: "Bulletproof coffee and almonds", lunch: "Beef stir fry", dinner: "Grilled turkey and green beans" },
          { breakfast: "Coconut yogurt", lunch: "Keto burger bowl", dinner: "Shrimp avocado salad" },
          { breakfast: "Keto smoothie", lunch: "Cauliflower pizza", dinner: "Steak and asparagus" }
        ],
        anything: [
          { breakfast: "Pancakes", lunch: "Chicken curry and rice", dinner: "Pizza" },
          { breakfast: "Fried rice", lunch: "Burger and fries", dinner: "Pasta" },
          { breakfast: "Croissant and coffee", lunch: "Shawarma", dinner: "Grilled platter" },
          { breakfast: "Churros and chocolate", lunch: "Ramen", dinner: "Kebab and naan" },
          { breakfast: "Paratha roll", lunch: "Steak", dinner: "Fish and chips" }
        ]
      },

      '2700-3000': {
        veg: [
          { breakfast: "Paratha with curd", lunch: "Vegetable pulao and curry", dinner: "Paneer tikka and naan" },
          { breakfast: "Chole bhature", lunch: "Rajma chawal", dinner: "Malai kofta with rice" },
          { breakfast: "Upma with sambhar", lunch: "Vegetable pasta", dinner: "Aloo gobi with paratha" },
          { breakfast: "Vegetable sandwich", lunch: "Dal tadka with jeera rice", dinner: "Matar paneer with chapati" },
          { breakfast: "Oats smoothie", lunch: "Veg fried rice", dinner: "Shahi paneer with naan" }
        ],
        'non-veg': [
          { breakfast: "Bacon and eggs", lunch: "Chicken biryani", dinner: "Grilled steak and potatoes" },
          { breakfast: "Chicken sandwich", lunch: "Fish fry and rice", dinner: "Butter chicken with naan" },
          { breakfast: "Salmon bagel", lunch: "Chicken wrap", dinner: "Grilled lamb chops" },
          { breakfast: "Egg paratha", lunch: "Mutton biryani", dinner: "Tandoori chicken" },
          { breakfast: "Protein smoothie and nuts", lunch: "Shrimp pasta", dinner: "Pork roast with veggies" }
        ],
        vegan: [
          { breakfast: "Smoothie bowl", lunch: "Chickpea stew", dinner: "Vegan pizza" },
          { breakfast: "Avocado toast", lunch: "Vegan sushi", dinner: "Stuffed zucchini boats" },
          { breakfast: "Fruit granola bowl", lunch: "Tofu rice bowl", dinner: "Lentil shepherd's pie" },
          { breakfast: "Oatmeal and berries", lunch: "Quinoa salad", dinner: "Vegan curry with rice" },
          { breakfast: "Chia pudding", lunch: "Hummus and pita", dinner: "Mushroom risotto" }
        ],
        keto: [
          { breakfast: "Cheese omelette", lunch: "Chicken thighs with zucchini", dinner: "Grilled salmon and spinach" },
          { breakfast: "Coconut smoothie", lunch: "Beef stir fry", dinner: "Pork ribs and salad" },
          { breakfast: "Almond butter pancakes", lunch: "Keto beef tacos", dinner: "Roast chicken and veggies" },
          { breakfast: "Keto protein shake", lunch: "Bunless burger", dinner: "Shrimp scampi" },
          { breakfast: "Boiled eggs and avocado", lunch: "Keto pizza", dinner: "Steak salad" }
        ],
        anything: [
          { breakfast: "Waffles and syrup", lunch: "Burger and fries", dinner: "Pasta with cheese" },
          { breakfast: "Biryani", lunch: "Shawarma wrap", dinner: "Chicken Alfredo pasta" },
          { breakfast: "Pancakes", lunch: "Sushi rolls", dinner: "Taco platter" },
          { breakfast: "Doughnuts and coffee", lunch: "Fried chicken", dinner: "Nachos and salsa" },
          { breakfast: "French toast", lunch: "BBQ ribs", dinner: "Loaded pizza" }
        ]
      }



    // You can add similar structures for other calorie ranges (1300-1500, 1500-1800, etc.)
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const range = calorieInput;

    if (!range || !dietData[range] || !dietData[range][dietType]) {
      alert('Please select a valid calorie range and diet type');
      return;
    }

    const plans = dietData[range][dietType];
    setAlternatives(plans);
    setCurrentIndex(0);
    setDietPlan(plans[0]);
  };

  const handleAlternative = () => {
    if (alternatives.length === 0) return;
    const nextIndex = (currentIndex + 1) % alternatives.length;
    setCurrentIndex(nextIndex);
    setDietPlan(alternatives[nextIndex]);
  };


  return (
    <div className="diet-page">
      <div className="top-nav">
        <button className="back-button" onClick={() => router.push('/dashboard')}>Back to Dashboard</button>
      </div>

      <div className="diet-content">
        <h1>Find Your Perfect Diet Plan</h1>
        <p className="description">Select your daily calorie range and preferred diet type to get personalized meal recommendations.</p>

        <form className="calorie-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="calorie-range">Calorie Range:</label>
            <select
              id="calorie-range"
              value={calorieInput}
              onChange={(e) => setCalorieInput(e.target.value)}
              required
            >
              <option value="">Select Calorie Range</option>
              <option value="1300-1500">1300-1500</option>
              <option value="1500-1800">1500-1800</option>
              <option value="1800-2100">1800-2100</option>
              <option value="2100-2400">2100-2400</option>
              <option value="2400-2700">2400-2700</option>
              <option value="2700-3000">2700-3000</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="diet-type">Diet Type:</label>
            <select
              id="diet-type"
              value={dietType}
              onChange={(e) => setDietType(e.target.value)}
            >
              <option value="veg">Vegetarian</option>
              <option value="non-veg">Non-Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="keto">Keto</option>
              <option value="anything">Anything</option>
            </select>
          </div>

          <button type="submit">Get Diet</button>
        </form>

        {dietPlan && (
          <>
            <div className="diet-plan-details">
              <div className="meal">
                <div className="meal-icon">🍳</div>
                <h3>Breakfast</h3>
                <p>{dietPlan.breakfast}</p>
              </div>
              <div className="meal">
                <div className="meal-icon">🥗</div>
                <h3>Lunch</h3>
                <p>{dietPlan.lunch}</p>
              </div>
              <div className="meal">
                <div className="meal-icon">🍽️</div>
                <h3>Dinner</h3>
                <p>{dietPlan.dinner}</p>
              </div>
            </div>

            <div className="alternative-buttons">
              <button onClick={handleAlternative}>
                <span className="button-icon">🔄</span>
                Show Another Alternative
              </button>
              <div className="meal-counter">
                Option {currentIndex + 1} of {alternatives.length}
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .diet-page {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          min-height: 100vh;
          background-color: #000000;
          color: #e0e0e0;
        }

        .top-nav {
          width: 100%;
          padding: 16px 24px;
          display: flex;
          justify-content: flex-start;
          background-color: #0a0a0a;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid #222;
        }

        .back-button {
          background-color: #3a86ff;
          color: white;
          padding: 10px 20px;
          border: none;
          cursor: pointer;
          font-size: 16px;
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .back-button:hover {
          background-color: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }

        .diet-content {
          width: 100%;
          max-width: 700px;
          padding: 32px;
          text-align: center;
          background-color: #1e1e1e;
          border-radius: 16px;
          box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
          margin: 32px auto;
          border: 1px solid #333;
        }

        .diet-content h1 {
          color: #ffffff;
          font-size: 2.2rem;
          font-weight: 700;
          margin-bottom: 16px;
          background: linear-gradient(90deg, #3a86ff, #ff0080);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .description {
          color: #a0a0a0;
          font-size: 1.1rem;
          line-height: 1.6;
          margin-bottom: 32px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }

        .calorie-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-bottom: 32px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-start;
          width: 100%;
        }

        label {
          font-size: 16px;
          color: #a0a0a0;
          font-weight: 500;
          margin-left: 4px;
        }

        select {
          width: 100%;
          padding: 14px 16px;
          font-size: 16px;
          background-color: #2a2a2a;
          color: #ffffff;
          border: 1px solid #444;
          border-radius: 8px;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a0a0a0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 16px center;
          background-size: 16px;
          transition: all 0.2s ease;
        }

        select:focus {
          border-color: #3a86ff;
          outline: none;
          box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.2);
        }

        button {
          padding: 14px 24px;
          background-color: #3a86ff;
          color: white;
          font-size: 16px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          border-radius: 8px;
          transition: all 0.2s ease;
          width: 100%;
          margin-top: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        button:hover {
          background-color: #2563eb;
          transform: translateY(-2px);
          box-shadow: 0 6px 10px rgba(0, 0, 0, 0.2);
        }

        .diet-plan-details {
          margin-top: 32px;
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 24px;
          width: 100%;
        }

        .meal {
          background-color: #252525;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.3s ease;
          border: 1px solid #333;
          position: relative;
          overflow: hidden;
        }

        .meal:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
        }

        .meal-icon {
          font-size: 28px;
          margin-bottom: 16px;
          background-color: #1a1a1a;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          margin-left: auto;
          margin-right: auto;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
          border: 2px solid #333;
        }

        .meal h3 {
          font-size: 20px;
          color: #3a86ff;
          margin-bottom: 12px;
          font-weight: 600;
          text-align: center;
        }

        .meal p {
          font-size: 16px;
          color: #e0e0e0;
          line-height: 1.6;
        }

        .alternative-buttons {
          margin-top: 32px;
          width: 100%;
        }

        .alternative-buttons button {
          background-color: #ff0080;
          font-size: 16px;
          font-weight: 600;
          padding: 14px 24px;
          width: 100%;
          max-width: 300px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .alternative-buttons button:hover {
          background-color: #e00070;
        }

        .button-icon {
          font-size: 20px;
          display: inline-block;
          animation: spin 2s linear infinite;
          animation-play-state: paused;
        }

        .alternative-buttons button:hover .button-icon {
          animation-play-state: running;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .meal-counter {
          margin-top: 12px;
          font-size: 14px;
          color: #a0a0a0;
          text-align: center;
        }

        @media (max-width: 768px) {
          .diet-content {
            padding: 24px 16px;
            margin: 16px;
            width: calc(100% - 32px);
          }

          .diet-plan-details {
            grid-template-columns: 1fr;
          }

          .diet-content h1 {
            font-size: 1.8rem;
          }
        }
      `}</style>
    </div>
  );
};
