"use client";
import React, { useState } from 'react';

//import "./Diet.css"
export const Diet=()=> {
 
  const [calorieInput, setCalorieInput] = useState('');
  const [dietType, setDietType] = useState('veg');
  const [dietPlan, setDietPlan] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const calorieRanges = [
    { min: 1000, max: 1300, label: "1000-1300" },
    { min: 1300, max: 1500, label: "1300-1500" },
    { min: 1500, max: 1800, label: "1500-1800" },
    { min: 1800, max: 2100, label: "1800-2100" },
    { min: 2100, max: 2400, label: "2100-2400" }
  ];

  const getCalorieRange = (cal) => {
    for (let range of calorieRanges) {
      if (cal >= range.min && cal < range.max) return range.label;
    }
    return null;
  };

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
        <button className="back-button" onClick={() => navigate('/')}>Back</button>
      </div>

      <div className="diet-content">
        <h1>Find Your Perfect Diet Plan</h1>

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
                <h3>Breakfast</h3>
                <p>{dietPlan.breakfast}</p>
              </div>
              <div className="meal">
                <h3>Lunch</h3>
                <p>{dietPlan.lunch}</p>
              </div>
              <div className="meal">
                <h3>Dinner</h3>
                <p>{dietPlan.dinner}</p>
              </div>
            </div>

            <div className="alternative-buttons">
              <button onClick={handleAlternative}>Show Another Alternative</button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .diet-page {
          font-family: Arial, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          height: 100vh;
        }

        .top-nav {
          width: 100%;
          padding: 10px 20px;
          display: flex;
          justify-content: flex-start;
        }

        .back-button {
          background-color: #FF6F61;
          color: white;
          padding: 10px 20px;
          border: none;
          cursor: pointer;
          font-size: 16px;
          border-radius: 5px;
        }

        .diet-content {
          width: 100%;
          max-width: 600px;
          padding: 20px;
          text-align: center;
          background-color: #f9f9f9;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-top: 20px;
        }

        .diet-content h1 {
          color: #333;
        }

        .calorie-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 5px;
          align-items: flex-start;
        }

        label {
          font-size: 14px;
          color: #555;
        }

        select {
          padding: 10px;
          font-size: 16px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }

        button {
          padding: 12px 20px;
          background-color: #FF6F61;
          color: white;
          font-size: 16px;
          border: none;
          cursor: pointer;
          border-radius: 5px;
          transition: background-color 0.3s;
        }

        button:hover {
          background-color: #FF4E40;
        }

        .diet-plan-details {
          margin-top: 20px;
        }

        .meal {
          margin-bottom: 15px;
        }

        .meal h3 {
          font-size: 18px;
          color: #333;
        }

        .meal p {
          font-size: 16px;
          color: #777;
        }

        .alternative-buttons {
          margin-top: 20px;
        }

        .alternative-buttons button {
          background-color: #FF9A8B;
          font-size: 16px;
        }

        .alternative-buttons button:hover {
          background-color: #FF6F61;
        }
      `}</style>
    </div>
  );
};
