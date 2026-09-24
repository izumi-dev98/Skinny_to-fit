# Skinny to Fit

A responsive React and Tailwind CSS TDEE planner for estimating BMR, TDEE, calorie surplus targets, and daily macros. It is designed as a practical starting point for people planning gradual weight gain or muscle-building nutrition.

## Project details

The app provides:

- Women and men BMR calculations using the Mifflin-St Jeor equations.
- TDEE calculations using five activity multipliers.
- A 20% calorie surplus target for both selected profiles.
- Centimeter or feet-and-inches height input with live centimeter conversion.
- A 30% protein, 50% carbohydrate, and 20% fat macro split.
- Macro calorie-to-gram conversion using 4/4/9 kcal-per-gram values.
- SweetAlert2 feedback for saving and resetting plans.
- Saved plans stored locally in the current browser.
- A responsive project guide available from the navbar.
- Practical surplus strategies and an in-app theory reference.

## Run locally

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

Create a production build with:

```bash
npm run build
```

## User guide

### 1. Open the planner

Run the development server and open the Vite URL shown in the terminal. The form starts empty so each user enters their own information.

### 2. Choose a profile

Select **Women** or **Men** in the **Calculate for** control. The selected profile determines which BMR equation is highlighted in the result card. No personalized result is shown until a profile is selected.

### 3. Enter personal details

- **Weight:** enter kilograms.
- **Age:** enter years.
- **Height:** choose centimeters or feet and inches.

When feet and inches are selected, the converted centimeter value appears immediately below the inputs and is used by the calculator.

### 4. Select activity

Choose the activity level that best matches normal weekly movement. The activity multiplier is applied to BMR to estimate TDEE.

### 5. Read the results

The selected profile displays:

- **BMR:** estimated resting energy use.
- **TDEE:** estimated energy use including activity.
- **Surplus target:** TDEE multiplied by 1.20.

The macro cards show the women's surplus example from the supplied theory: protein, carbohydrates, and fats as grams and calories.

### 6. Save a plan

Enter an optional plan name and select **Save plan**. The plan stores the entered profile, measurements, activity level, height unit, and calculated targets. Select a saved plan later to load it back into the form.

### 7. Use the project guide

Select **How to use this project** in the navbar to open the in-app guide. On small screens, the same action is available through the help icon.

## Developer guide

### Project structure

```text
.
├── index.html          Vite HTML entry point
├── package.json        Scripts and dependencies
├── vite.config.js      Vite, React, and Tailwind configuration
├── README.md           Project documentation
└── src/
	├── App.jsx         Calculator UI, formulas, guide, and persistence
	├── index.css       Tailwind theme and shared component styles
	└── main.jsx        React application entry point
```

### Available scripts

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |

### Data and persistence

Saved plans use the localStorage key `skinny-to-fit-plans`. Data remains on the current browser and device only; there is no backend or account synchronization. Clearing browser storage removes saved plans.

Each new plan stores the plan name, selected profile, weight, age, height unit, height values, activity level, creation timestamp, and calculated women/men surplus targets.

### Validation behavior

The form requires a profile, weight, age, height, and activity level before a plan can be saved. Missing required values trigger a SweetAlert2 warning. The calculator remains live while values are being entered, so incomplete forms display placeholders instead of misleading results.

1. Choose Women or Men.
2. Enter weight, age, and height.
3. Enter height in centimeters or feet and inches. Feet and inches are converted to centimeters automatically.
4. Select an activity level.
5. Review BMR, TDEE, and the 20% surplus target.
6. Save a named plan. Saved plans are stored in the browser's `localStorage`.

## Formulas

### Women BMR

```text
(10 × weight) + (6.25 × height) − (5 × age) − 161
```

### Men BMR

```text
(10 × weight) + (6.25 × height) − (5 × age) + 5
```

### TDEE

```text
BMR × activity multiplier
```

### Surplus target

```text
TDEE × 1.20
```

The macro panel uses the women's surplus target with a 30% protein, 50% carbohydrate, and 20% fat split. Calories are converted to grams using 4 kcal/g for protein and carbohydrates, and 9 kcal/g for fats.

### Height conversion

```text
centimeters = (feet × 30.48) + (inches × 2.54)
```

### Macro conversion

```text
protein grams = protein calories ÷ 4
carbohydrate grams = carbohydrate calories ÷ 4
fat grams = fat calories ÷ 9
```

## Activity multipliers

| Activity | Multiplier |
| --- | ---: |
| Sedentary | 1.2 |
| Lightly active | 1.375 |
| Moderately active | 1.55 |
| Very active | 1.725 |
| Extra active | 1.9 |

## Tech stack

- React
- Vite
- Tailwind CSS
- SweetAlert2
- Lucide React

## Important note

These calculations are estimates and are not medical advice. Actual calorie needs can vary with health, training, digestion, sleep, and other factors. Use the result as a starting point and adjust gradually based on progress and how you feel.
