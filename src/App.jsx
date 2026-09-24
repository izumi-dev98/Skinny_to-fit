import { useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'
import foodData from '../data.js'
import { Activity, ArrowRight, Bookmark, Check, ChevronDown, CircleHelp, Clock3, Droplets, Flame, History, RotateCcw, Sparkles, Trash2, Utensils, UtensilsCrossed, X } from 'lucide-react'

const STORAGE_KEY = 'skinny-to-fit-plans'

const activityLevels = [
  { value: 'sedentary', label: 'Sedentary', detail: 'Little or no exercise', multiplier: 1.2 },
  { value: 'lightlyActive', label: 'Lightly active', detail: 'Exercise 1–3 days per week', multiplier: 1.375 },
  { value: 'moderatelyActive', label: 'Moderately active', detail: 'Exercise 3–5 days per week', multiplier: 1.55 },
  { value: 'veryActive', label: 'Very active', detail: 'Hard exercise 6–7 days per week', multiplier: 1.725 },
  { value: 'extraActive', label: 'Extra active', detail: 'Hard training or physical job', multiplier: 1.9 },
]

const initialForm = {
  name: '',
  sex: '',
  bodyWeight: '',
  heightUnit: 'cm',
  heightCm: '',
  heightFeet: '',
  heightInches: '',
  age: '',
  activity: '',
}

const formatNumber = (value) => value > 0 ? Math.round(value).toLocaleString() : '--'
const getHeightCm = (form) => form.heightUnit === 'cm'
  ? Number(form.heightCm) || 0
  : ((Number(form.heightFeet) || 0) * 30.48) + ((Number(form.heightInches) || 0) * 2.54)

const translations = {
  en: {
    guideButton: 'How to use this project', heroLabel: 'Daily fuel planner', heroTitle: 'Eat with a little more', heroAccent: 'intention.', activityNames: { sedentary: 'Sedentary', lightlyActive: 'Lightly active', moderatelyActive: 'Moderately active', veryActive: 'Very active', extraActive: 'Extra active' },
    formTitle: 'Tell us about you', planName: 'Plan name', optional: '(optional)', calculateFor: 'Calculate for', women: 'Women', men: 'Men', weight: 'Weight', age: 'Age', height: 'Height', years: 'years', cm: 'Centimeters', feetInches: 'Feet + inches', feet: 'Feet', inches: 'Inches', converted: 'Converted height', conversion: 'Feet and inches are automatically converted to centimeters for the formula.', activity: 'Activity level', selectActivity: 'Select your activity level', save: 'Save plan', reset: 'Reset',
    resultsTitle: 'A useful starting point', chooseProfile: 'Choose Women or Men', resultPrompt: 'Your BMR, TDEE, and surplus target will appear here.', personalized: 'Your personalized target', ready: 'Ready when you are', selectedPrompt: 'This target adds 20% to your TDEE. Adjust it based on your progress and how you feel.', choosePrompt: 'Choose Women or Men above to calculate your daily target.', macroTitle: 'A simple daily split', protein: 'Protein', carbs: 'Carbs', fats: 'Fats',
    playbookTitle: 'Make extra calories feel easier', density: 'Choose calorie density', densityText: 'Use compact staples like rice, pasta, avocado, peanut butter, and cooking oils before filling up on bulky low-calorie foods.', liquid: 'Drink some calories', liquidText: 'A smoothie with whole milk, banana, peanut butter, oats, and protein powder can add 500–600 calories comfortably.', window: 'Use a meal window', windowText: 'Give a substantial meal 15–20 minutes of calm, unrushed eating, then pause and check how comfortably full you feel.', smaller: 'Make meals smaller', smallerText: 'Split your daily intake across 5 or 6 manageable meals to keep digestion comfortable and energy steady.', strategyDetails: { density: ['Add olive oil to rice, pasta, or vegetables.', 'Use peanut butter on toast, oats, or bananas.', 'Choose avocado, cheese, nuts, and full-fat yogurt.', 'Keep bulky salads and large amounts of water-rich vegetables after calorie-dense foods.'], liquid: ['Blend whole milk, banana, oats, peanut butter, and protein powder.', 'Add yogurt or honey when you need more energy.', 'Drink the shake between meals instead of replacing every meal.', 'Start with a smaller serving and increase it if digestion feels comfortable.'], window: ['Prepare the portion before starting.', 'Eat calmly within a 15–20 minute meal window.', 'Pause after the meal and check hunger and comfort.', 'Do not force food if you feel pain, nausea, or distress.'], smaller: ['Try breakfast, snack, lunch, snack, dinner, and an evening snack.', 'Pair protein and carbohydrates in each main meal.', 'Keep easy snacks ready: yogurt, fruit, nuts, sandwiches, or milk.', 'Use smaller portions more often instead of very large meals.'] },
    theoryTitle: 'How The Theory Work', bmrMeaning: 'Basal Metabolic Rate: the energy your body uses at rest for essential functions.', tdeeMeaning: 'Total Daily Energy Expenditure: your estimated daily energy use including activity.', womenBmr: 'Women’s BMR', menBmr: 'Men’s BMR', tdee: 'TDEE', surplus: 'Surplus target', macroGrams: 'Macro grams', theoryNote: 'The macro panel uses the women’s surplus target and the 30% protein, 50% carbohydrate, and 20% fat split from your theory.', foodExamples: { protein: 'Eggs, chicken, fish, Greek yogurt, tofu', carbs: 'Rice, oats, potatoes, pasta, bananas', fats: 'Avocado, peanut butter, nuts, olive oil' },
    saved: 'Saved plans', savedLocal: 'Saved locally on this device.', disclaimer: 'Calculations are estimates, not medical advice.', selected: 'Selected', target: '20% surplus target', dailyCalories: 'Daily calories (TDEE)', tdeeInfo: 'The total amount of calories your body burns throughout the day. This is your estimated daily energy use, including rest and normal activity.', surplusInfo: 'This target adds 20% more calories than your TDEE. It is a starting estimate for gradual weight gain and muscle building. For example, a TDEE of 1,134 kcal becomes about 1,361 kcal.', kcal: 'kcal',
    guideTitle: 'How to use this project', guideLabel: 'Project guide', guideTip: 'Tip:', guideTipText: 'Treat the result as a starting estimate. Track progress and adjust food intake gradually.', close: 'Close project guide', detailsTitle: 'Your plan is ready', closeDetails: 'Close details', viewDetails: 'View plan details', calculationDetails: 'Calculation details', bmrLabel: 'Basal metabolic rate', multiplierLabel: 'Activity multiplier', inputContext: 'Based on your entered measurements', activityExamples: { sedentary: 'Little or no exercise', lightlyActive: 'Exercise 1–3 days per week', moderatelyActive: 'Exercise 3–5 days per week', veryActive: 'Hard exercise 6–7 days per week', extraActive: 'Hard training or physical job' },
  },
  my: {
    guideButton: 'ဒီပရောဂျက်ကို အသုံးပြုနည်း', heroLabel: 'နေ့စဉ် စွမ်းအင် စီမံချက်', heroTitle: 'ရည်ရွယ်ချက်ရှိရှိ အစားအစာကို', heroAccent: 'စားသုံးပါ။',
    formTitle: 'သင့်အကြောင်း ပြောပြပါ', planName: 'စီမံချက်အမည်', optional: '(မဖြစ်မနေ မဟုတ်ပါ)', calculateFor: 'သင့်လိင်အမျိုးအစား ရွေးပါ', women: 'အမျိုးသမီး', men: 'အမျိုးသား', weight: 'ကိုယ်အလေးချိန်', age: 'အသက်', height: 'အရပ်', years: 'နှစ်', cm: 'စင်တီမီတာ', feetInches: 'ပေ + လက်မ', feet: 'ပေ', inches: 'လက်မ', converted: 'ပြောင်းလဲထားသော အရပ်', conversion: 'ပေနှင့် လက်မကို ဖော်မြူလာအတွက် စင်တီမီတာသို့ အလိုအလျောက် ပြောင်းလဲပေးသည်။', activity: 'လှုပ်ရှားမှုအဆင့်', selectActivity: 'လှုပ်ရှားမှုအဆင့် ရွေးပါ', save: 'စီမံချက် သိမ်းမည်', reset: 'ပြန်စမည်', activityNames: { sedentary: 'လှုပ်ရှားမှုနည်း', lightlyActive: 'အနည်းငယ် လှုပ်ရှားမှုရှိ', moderatelyActive: 'အလယ်အလတ် လှုပ်ရှားမှုရှိ', veryActive: 'အလွန် လှုပ်ရှားမှုရှိ', extraActive: 'အထူးပြင်းထန်စွာ လှုပ်ရှားမှုရှိ' },
    resultsTitle: 'စတင်ရန် အသုံးဝင်သော အချက်အလက်', chooseProfile: 'အမျိုးသမီး သို့မဟုတ် အမျိုးသား ရွေးပါ', resultPrompt: 'BMR၊ TDEE နှင့် ပိုလျှံကယ်လိုရီ ပမာဏကို ဤနေရာတွင် ပြပါမည်။', personalized: 'သင့်အတွက် တွက်ချက်ထားသော ပမာဏ', ready: 'စတင်ရန် အသင့်ဖြစ်ပါပြီ', selectedPrompt: 'ဤပမာဏတွင် TDEE ၏ ၂၀% ကို ထပ်ပေါင်းထားသည်။ သင့်တိုးတက်မှုနှင့် ခံစားချက်အပေါ် မူတည်၍ ပြင်ဆင်ပါ။', choosePrompt: 'နေ့စဉ်ပမာဏတွက်ရန် အထက်တွင် အမျိုးသမီး သို့မဟုတ် အမျိုးသားကို ရွေးပါ။', macroTitle: 'နေ့စဉ် အာဟာရခွဲဝေမှု', protein: 'ပရိုတင်း', carbs: 'ကာဗိုဟိုက်ဒရိတ်', fats: 'အဆီ',
    playbookTitle: 'ပိုလျှုံကော ကယ်လိုရီ ပမဏ ရရှိရန်အတွက် လွယ်ကူသော နည်းလမ်းများ', liquid: 'အရည်မှ ကယ်လိုရီရယူပါ', liquidText: 'နို့ပြည့်၊ ငှက်ပျောသီး၊ မြေပဲထောပတ်၊ အုတ်ဂျုံနှင့် ပရိုတင်းမှုန့်ပါသော ဖျော်ရည်သည် ကယ်လိုရီ ၅၀၀–၆၀၀ ရရှိရန် လွယ်ကူစေသည်။', window: 'အစားစားချိန် သတ်မှတ်ပါ', windowText: 'အစားအစာကို အလျင်မလိုဘဲ ၁၅–၂၀ မိနစ်ခန့် စားပြီးနောက် ကိုယ်အဆင်ပြေမှုကို ပြန်လည်သုံးသပ်ပါ။', smaller: 'အစားအစာကို ပိုင်း၍ စားပါ', smallerText: 'တစ်နေ့တာအစားအစာကို ၅ ကြိမ် သို့မဟုတ် ၆ ကြိမ်ခွဲစားခြင်းဖြင့် အစာချေဖျက်မှုနှင့် စွမ်းအင်ကို ပိုမိုထိန်းညှိနိုင်သည်။', strategyDetails: { density: ['ထမင်း၊ ခေါက်ဆွဲ သို့မဟုတ် ဟင်းသီးဟင်းရွက်တွင် သံလွင်ဆီထည့်ပါ။', 'ပေါင်မုန့်၊ အုတ်ဂျုံ သို့မဟုတ် ငှက်ပျောသီးတွင် မြေပဲထောပတ်ထည့်ပါ။', 'ထောပတ်သီး၊ ချိစ်၊ အခွံမာသီးနှင့် နို့အပြည့်ဒိန်ချဉ်ကို ရွေးပါ။', 'ကယ်လိုရီသိပ်သည်းသော အစားအစာများကို အရင်စားပြီး အသုပ်အများကြီးကို နောက်မှစားပါ။'], liquid: ['နို့ပြည့်၊ ငှက်ပျောသီး၊ အုတ်ဂျုံ၊ မြေပဲထောပတ်နှင့် ပရိုတင်းမှုန့်ကို ရောဖျော်ပါ။', 'စွမ်းအင်ပိုလိုလျှင် ဒိန်ချဉ် သို့မဟုတ် ပျားရည်ထည့်ပါ။', 'ဖျော်ရည်ကို အစားအစာအစားမဟုတ်ဘဲ အစားကြားတွင် သောက်ပါ။', 'အစာချေဖျက်မှုအဆင်ပြေလျှင် ပမာဏကို ဖြည်းဖြည်းချင်း တိုးပါ။'], window: ['စားမည့်ပမာဏကို ကြိုတင်ပြင်ဆင်ပါ။', '၁၅–၂၀ မိနစ်အတွင်း အေးဆေးစွာ စားပါ။', 'စားပြီးနောက် ဗိုက်ဆာမှုနှင့် ကိုယ်အဆင်ပြေမှုကို စစ်ဆေးပါ။', 'နာကျင်ခြင်း၊ အန်ချင်ခြင်း သို့မဟုတ် မသက်သာခြင်းရှိလျှင် အတင်းမစားပါနှင့်။'], smaller: ['မနက်စာ၊ အဆာပြေ၊ နေ့လယ်စာ၊ အဆာပြေ၊ ညစာနှင့် ညအဆာပြေဟူ၍ စားကြည့်ပါ။', 'အဓိကအစားအစာတိုင်းတွင် ပရိုတင်းနှင့် ကာဗိုဟိုက်ဒရိတ်ကို တွဲစားပါ။', 'ဒိန်ချဉ်၊ သစ်သီး၊ အခွံမာသီး၊ အသားညှပ်ပေါင်မုန့် သို့မဟုတ် နို့ကို အဆင်သင့်ထားပါ။', 'အစားအစာကြီးကြီးစားမည့်အစား ပမာဏနည်းနည်းကို မကြာခဏစားပါ။'] },
    theoryTitle: 'သီအိုရီ အလုပ်လုပ်ပုံ', bmrMeaning: 'Basal Metabolic Rate: အနားယူနေချိန်တွင် အခြေခံကိုယ်ခန္ဓာလုပ်ဆောင်ချက်များအတွက် သုံးစွဲသော စွမ်းအင်။', tdeeMeaning: 'Total Daily Energy Expenditure: လှုပ်ရှားမှုအပါအဝင် တစ်နေ့တာ ခန့်မှန်းစွမ်းအင်သုံးစွဲမှု။', womenBmr: 'အမျိုးသမီး BMR', menBmr: 'အမျိုးသား BMR', tdee: 'TDEE', surplus: 'ပိုလျှံကယ်လိုရီ ပမာဏ', macroGrams: 'အာဟာရဂရမ်', theoryNote: 'Macro အပိုင်းတွင် အမျိုးသမီး ပိုလျှံကယ်လိုရီပမာဏနှင့် ပရိုတင်း ၃၀%၊ ကာဗိုဟိုက်ဒရိတ် ၅၀%၊ အဆီ ၂၀% ခွဲဝေမှုကို အသုံးပြုထားသည်။', foodExamples: { protein: 'ကြက်ဥ၊ ကြက်သား၊ ငါး၊ ဂရိဒိန်ချဉ်၊ တို့ဖူး', carbs: 'ထမင်း၊ အုတ်ဂျုံ၊ အာလူး၊ ခေါက်ဆွဲ၊ ငှက်ပျောသီး', fats: 'ထောပတ်သီး၊ မြေပဲထောပတ်၊ အခွံမာသီး၊ သံလွင်ဆီ' },
    saved: 'သိမ်းထားသော စီမံချက်များ', savedLocal: 'ဤစက်တွင်သာ သိမ်းထားသည်။', disclaimer: 'တွက်ချက်မှုများသည် ခန့်မှန်းချက်များသာဖြစ်ပြီး ဆေးဘက်ဆိုင်ရာ အကြံဉာဏ်မဟုတ်ပါ။', selected: 'ရွေးထားသည်', target: '၂၀% ပိုလျှံပမာဏ', dailyCalories: 'တစ်နေ့တာ ကယ်လိုရီ (TDEE)', tdeeInfo: 'တစ်နေ့တာအတွင်း သင့်ခန္ဓာကိုယ်က စုစုပေါင်းလောင်ကျွမ်းသွားတဲ့ ကယ်လိုရီပမာဏ ဖြစ်ပါတယ်။ အနားယူချိန်နှင့် ပုံမှန်လှုပ်ရှားမှုများအပါအဝင် တစ်နေ့တာ စွမ်းအင်သုံးစွဲမှုကို ခန့်မှန်းပြသပေးပါတယ်။', surplusInfo: 'ဤပမာဏတွင် TDEE ထက် ကယ်လိုရီ ၂၀% ပိုမိုပါဝင်ပါတယ်။ ကိုယ်အလေးချိန်ကို ဖြည်းဖြည်းချင်းတိုးရန်နှင့် ကြွက်သားတည်ဆောက်ရန် စတင်အသုံးပြုနိုင်ပါတယ်။ ဥပမာ TDEE ၁,၁၃၄ ကယ်လိုရီ ဖြစ်လျှင် ပိုလျှံပမာဏမှာ ခန့်မှန်း ၁,၃၆၁ ကယ်လိုရီ ဖြစ်ပါတယ်။', kcal: 'ကယ်လိုရီ',
    guideTitle: 'ဒီပရောဂျက်ကို အသုံးပြုနည်း', guideLabel: 'ပရောဂျက် လမ်းညွှန်', guideTip: 'အကြံပြုချက်:', guideTipText: 'ရလဒ်ကို စတင်ရန် ခန့်မှန်းချက်အဖြစ်သာ သုံးပါ။ တိုးတက်မှုကို စောင့်ကြည့်ပြီး အစားအစာပမာဏကို ဖြည်းဖြည်းချင်း ပြင်ဆင်ပါ။', close: 'လမ်းညွှန် ပိတ်မည်', detailsTitle: 'သင့်စီမံချက် အသင့်ဖြစ်ပါပြီ', closeDetails: 'အသေးစိတ် ပိတ်မည်', viewDetails: 'စီမံချက် အသေးစိတ်ကြည့်မည်', activityExamples: { sedentary: 'လေ့ကျင့်ခန်း မလုပ်ခြင်း သို့မဟုတ် အနည်းငယ်သာလုပ်ခြင်း', lightlyActive: 'တစ်ပတ်လျှင် ၁–၃ ရက် လေ့ကျင့်ခန်းလုပ်ခြင်း', moderatelyActive: 'တစ်ပတ်လျှင် ၃–၅ ရက် လေ့ကျင့်ခန်းလုပ်ခြင်း', veryActive: 'တစ်ပတ်လျှင် ၆–၇ ရက် ပြင်းထန်စွာ လေ့ကျင့်ခြင်း', extraActive: 'ပြင်းထန်သော လေ့ကျင့်မှု သို့မဟုတ် ကိုယ်လက်အလုပ်လုပ်ခြင်း' },
  },
}

function App() {
  const [form, setForm] = useState(initialForm)
  const [showGuide, setShowGuide] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [strategyModal, setStrategyModal] = useState(null)
  const [language, setLanguage] = useState(() => localStorage.getItem('skinny-to-fit-language') === 'my' ? 'my' : 'en')
  const t = translations[language]
  const [savedPlans, setSavedPlans] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
    } catch {
      return []
    }
  })

  const results = useMemo(() => {
    const weight = Number(form.bodyWeight) || 0
    const height = getHeightCm(form)
    const age = Number(form.age) || 0
    const activity = activityLevels.find((item) => item.value === form.activity) || { multiplier: 0 }
    const bmrWomen = (10 * weight) + (6.25 * height) - (5 * age) - 161
    const bmrMen = (10 * weight) + (6.25 * height) - (5 * age) + 5
    const tdeeWomen = bmrWomen * activity.multiplier
    const tdeeMen = bmrMen * activity.multiplier
    const targetWomen = tdeeWomen * 1.2
    const targetMen = tdeeMen * 1.2
    return {
      women: { bmr: Math.max(0, bmrWomen), tdee: Math.max(0, tdeeWomen), target: Math.max(0, targetWomen) },
      men: { bmr: Math.max(0, bmrMen), tdee: Math.max(0, tdeeMen), target: Math.max(0, targetMen) },
      activity,
      macros: {
        protein: { grams: (targetWomen * 0.3) / 4, calories: targetWomen * 0.3 },
        carbs: { grams: (targetWomen * 0.5) / 4, calories: targetWomen * 0.5 },
        fats: { grams: (targetWomen * 0.2) / 9, calories: targetWomen * 0.2 },
      },
    }
  }, [form])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedPlans))
  }, [savedPlans])

  useEffect(() => {
    localStorage.setItem('skinny-to-fit-language', language)
  }, [language])

  const updateForm = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const isFormComplete = form.sex && form.bodyWeight && form.age && form.activity && (
    form.heightUnit === 'cm' ? form.heightCm : form.heightFeet
  )

  const savePlan = () => {
    if (!isFormComplete) {
      Swal.fire({
        title: 'Complete your details',
        text: 'Choose Women or Men, then add your weight, age, height, and activity level.',
        icon: 'warning',
        confirmButtonText: 'Back to form',
        confirmButtonColor: '#e56c48',
        background: '#fffaf4',
        color: '#26352f',
      })
      return
    }
    const plan = {
      ...form,
      name: form.name.trim() || 'My TDEE plan',
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      targetWomen: results.women.target,
      targetMen: results.men.target,
    }
    setSavedPlans((current) => [plan, ...current].slice(0, 5))
    setShowDetails(true)
    Swal.fire({
      title: 'Plan saved',
      text: 'Your numbers are ready whenever you come back.',
      icon: 'success',
      confirmButtonText: 'Great',
      confirmButtonColor: '#e56c48',
      background: '#fffaf4',
      color: '#26352f',
    })
  }

  const resetForm = () => {
    setForm(initialForm)
    Swal.fire({
      title: 'Calculator reset',
      text: 'Your starting values are back in place.',
      icon: 'info',
      confirmButtonText: 'Okay',
      confirmButtonColor: '#26352f',
      background: '#fffaf4',
      color: '#26352f',
    })
  }

  const loadPlan = (plan) => setForm({
    name: plan.name,
    sex: plan.sex || '',
    bodyWeight: plan.bodyWeight,
    heightUnit: plan.heightUnit || 'cm',
    heightCm: plan.heightCm || plan.height || '',
    heightFeet: plan.heightFeet || '',
    heightInches: plan.heightInches || '',
    age: plan.age,
    activity: plan.activity,
  })

  const deletePlan = (id) => setSavedPlans((current) => current.filter((plan) => plan.id !== id))
  const hasSavedPlan = savedPlans.length > 0
  const selectedResult = form.sex === 'female' ? results.women : results.men
  const viewSavedPlan = (plan) => {
    loadPlan(plan)
    setShowDetails(true)
  }

  return (
    <main className="min-h-screen w-full max-w-[100vw] overflow-hidden bg-[#f7f3ed] text-[#26352f]">
      <div className="pointer-events-none absolute left-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-[#f5d7c8] opacity-70 blur-3xl" />
      <div className="pointer-events-none absolute right-[-6rem] top-32 h-96 w-96 rounded-full bg-[#dce7d5] opacity-70 blur-3xl" />
      <div className="relative mx-auto w-full max-w-7xl px-5 pb-12 pt-6 sm:px-8 lg:px-12">
        <header className="sticky top-0 z-40 -mx-5 flex items-center justify-between border-b border-[#26352f]/10 bg-[#f7f3ed]/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-12 lg:px-12">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#26352f] text-[#f7f3ed] shadow-lg shadow-[#26352f]/10"><Sparkles size={18} /></div>
            <div>
              <p className="font-display text-lg font-semibold tracking-tight">Skinny to Fit</p>
             
            </div>
          </div>
         
          <div className="flex items-center gap-2"><button className="language-toggle" type="button" aria-label="Switch language" onClick={() => setLanguage(language === 'en' ? 'my' : 'en')}><span className={language === 'en' ? 'language-active' : ''}>EN</span><span className={language === 'my' ? 'language-active' : ''}>မြန်မာ</span></button><button className="button-secondary px-3 sm:px-4" type="button" aria-label={t.guideButton} onClick={() => setShowGuide(true)}><CircleHelp size={16} /><span className="hidden sm:inline">{t.guideButton}</span></button></div>
        </header>

        <section className="grid gap-10 pb-10 pt-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:pt-20">
          <div key={language} className="max-w-xl animate-rise">
            <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#e56c48]"><span className="h-px w-8 bg-[#e56c48]" /> Daily fuel planner</div>
            <h1 className="font-display text-5xl font-bold leading-[0.98] tracking-[-0.04em] text-[#26352f] sm:text-7xl">Eat with a little more <em className="font-editorial font-normal text-[#e56c48]">intention.</em></h1>
           
          </div>
          
        </section>

        <section className={hasSavedPlan ? 'grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]' : 'mx-auto max-w-2xl'}>
          <form className="rounded-[1.75rem] border border-[#26352f]/10 bg-white/80 p-6 shadow-[0_24px_70px_rgba(38,53,47,0.08)] backdrop-blur sm:p-8" onSubmit={(event) => { event.preventDefault(); savePlan() }}>
            <div className="mb-8 flex items-start justify-between"><div><h2 className="font-display text-3xl font-bold tracking-tight">{t.formTitle}</h2></div><div className="rounded-full bg-[#f7f3ed] p-3 text-[#e56c48]"><Activity size={20} /></div></div>
            <label className="field-label">{t.planName} <span className="font-normal text-[#a0aaa3]">{t.optional}</span><input className="field" value={form.name} onChange={(event) => updateForm('name', event.target.value)} placeholder="e.g. My summer reset" /></label>
            <fieldset className="mt-5"><legend className="field-label">{t.calculateFor}</legend><div className="grid grid-cols-2 gap-2 rounded-xl bg-[#f7f3ed] p-1"><button type="button" className={`choice ${form.sex === 'female' ? 'choice-active' : ''}`} onClick={() => updateForm('sex', 'female')}>{t.women}</button><button type="button" className={`choice ${form.sex === 'male' ? 'choice-active' : ''}`} onClick={() => updateForm('sex', 'male')}>{t.men}</button></div></fieldset>
            <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="field-label">{t.weight} <span>(kg)</span><input className="field" type="number" min="1" step="0.1" value={form.bodyWeight} onChange={(event) => updateForm('bodyWeight', event.target.value)} placeholder={t.weight} /></label><label className="field-label">{t.age} <span>({t.years})</span><input className="field" type="number" min="13" step="1" value={form.age} onChange={(event) => updateForm('age', event.target.value)} placeholder={t.age} /></label></div>
            <fieldset className="mt-5"><legend className="field-label">{t.height}</legend><div className="mb-2 grid grid-cols-2 gap-2 rounded-xl bg-[#f7f3ed] p-1"><button type="button" className={`choice ${form.heightUnit === 'cm' ? 'choice-active' : ''}`} onClick={() => updateForm('heightUnit', 'cm')}>{t.cm}</button><button type="button" className={`choice ${form.heightUnit === 'ft' ? 'choice-active' : ''}`} onClick={() => updateForm('heightUnit', 'ft')}>{t.feetInches}</button></div>{form.heightUnit === 'cm' ? <input className="field" type="number" min="50" step="0.1" value={form.heightCm} onChange={(event) => updateForm('heightCm', event.target.value)} placeholder={t.height} /> : <><div className="grid grid-cols-2 gap-3"><label className="field-label">{t.feet}<input className="field" type="number" min="1" max="8" step="1" value={form.heightFeet} onChange={(event) => updateForm('heightFeet', event.target.value)} placeholder="5" /></label><label className="field-label">{t.inches}<input className="field" type="number" min="0" max="11" step="0.1" value={form.heightInches} onChange={(event) => updateForm('heightInches', event.target.value)} placeholder="5" /></label></div><div className="mt-3 flex items-center justify-between rounded-xl bg-[#dce7d5] px-4 py-3"><span className="text-xs font-bold uppercase tracking-[0.12em] text-[#4c6d50]">{t.converted}</span><strong className="font-display text-xl text-[#26352f]">{getHeightCm(form) ? `${getHeightCm(form).toFixed(1)} cm` : '-- cm'}</strong></div></>}<p className="mt-2 text-xs font-normal normal-case tracking-normal text-[#a0aaa3]">{t.conversion}</p></fieldset>
            <label className="field-label mt-5">{t.activity}<div className="relative"><select className="field appearance-none pr-10" value={form.activity} onChange={(event) => updateForm('activity', event.target.value)}><option value="">{t.selectActivity}</option>{activityLevels.map((item) => <option key={item.value} value={item.value}>{t.activityNames[item.value]} · {t.activityExamples[item.value]}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#758077]" size={18} /></div></label>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><button className="button-primary flex-1" type="submit"><Bookmark size={17} /> {t.save}</button><button className="button-secondary" type="button" onClick={resetForm}><RotateCcw size={16} /> {t.reset}</button></div>
            {!hasSavedPlan && <div className="mt-8 border-t border-[#26352f]/10 pt-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#e56c48]">{language === 'my' ? 'သိမ်းဆည်းမှု လုပ်ငန်းစဉ်' : 'Save process'}</p><div className="mt-4 space-y-3"><ProcessStep number="1" text={language === 'my' ? 'သင့်ကိုယ်ရေးအချက်အလက်ကို ထည့်ပါ' : 'Enter your personal details'} /><ProcessStep number="2" text={language === 'my' ? 'အမျိုးသမီး သို့မဟုတ် အမျိုးသားကို ရွေးပါ' : 'Choose Women or Men'} /><ProcessStep number="3" text={language === 'my' ? 'စီမံချက်ကို သိမ်းပြီး ရလဒ်များကို ကြည့်ပါ' : 'Save the plan to reveal your results'} /></div></div>}
          </form>

          {hasSavedPlan && <div className="space-y-6">
            <section className="rounded-[1.75rem] border border-[#26352f]/10 bg-white/75 p-6 shadow-[0_24px_70px_rgba(38,53,47,0.06)] sm:p-8"><div className="mb-5 flex items-center gap-2"><History size={18} className="text-[#e56c48]" /><h2 className="font-display text-2xl font-bold">{t.saved}</h2><span className="rounded-full bg-[#dce7d5] px-2 py-0.5 text-xs font-bold text-[#4c6d50]">{savedPlans.length}</span></div><div className="space-y-3">{savedPlans.map((plan) => <div className="rounded-2xl border border-[#26352f]/10 bg-white/70 p-4" key={plan.id}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold">{plan.name}</p><p className="mt-1 text-xs text-[#758077]">{plan.sex === 'female' ? t.women : t.men} {formatNumber(plan.sex === 'female' ? (plan.targetWomen || plan.target) : (plan.targetMen || plan.target))} {t.kcal}</p></div><button className="rounded-lg p-2 text-[#a0aaa3] transition hover:bg-[#f5d7c8] hover:text-[#e56c48]" type="button" aria-label={`Delete ${plan.name}`} onClick={() => deletePlan(plan.id)}><Trash2 size={16} /></button></div><button className="button-secondary mt-4 w-full" type="button" onClick={() => viewSavedPlan(plan)}>{t.viewDetails}</button></div>)}</div></section>
          </div>}
          {hasSavedPlan && <div className="hidden space-y-6">
            <div className="rounded-[1.75rem] bg-[#26352f] p-6 text-[#f7f3ed] shadow-[0_24px_70px_rgba(38,53,47,0.18)] sm:p-8">
              <div className="flex items-start justify-between"><div><h2 className="font-display text-3xl font-bold tracking-tight">{t.resultsTitle}</h2></div><Flame className="text-[#f3a187]" size={24} /></div>
              <div className="mt-8">{form.sex ? <ProfileResult label={form.sex === 'female' ? t.women : t.men} result={form.sex === 'female' ? results.women : results.men} accent={form.sex === 'female' ? 'text-[#f3a187]' : 'text-[#dce7d5]'} selected selectedText={t.selected} targetText={t.target} kcalText={t.kcal} /> : <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-8 text-center"><p className="font-display text-2xl font-semibold text-white/80">{t.chooseProfile}</p><p className="mt-2 text-sm text-white/50">{t.resultPrompt}</p></div>}</div>
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-white/55">{form.sex ? t.personalized : t.ready}</p><p className="mt-1 text-sm text-white/75">{form.sex ? t.selectedPrompt : t.choosePrompt}</p></div><ArrowRight className="shrink-0 text-[#f3a187]" size={25} /></div>
            </div>
            <div className="rounded-[1.75rem] border border-[#26352f]/10 bg-[#fffaf4] p-6 sm:p-8"><div className="flex items-start justify-between"><div><h2 className="font-display text-3xl font-bold tracking-tight">{t.macroTitle}</h2></div><Utensils className="text-[#758077]" size={22} /></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><Macro label={t.protein} grams={results.macros.protein.grams} calories={results.macros.protein.calories} percent="30%" color="bg-[#e56c48]" example={t.foodExamples.protein} /><Macro label={t.carbs} grams={results.macros.carbs.grams} calories={results.macros.carbs.calories} percent="50%" color="bg-[#d5a23c]" example={t.foodExamples.carbs} /><Macro label={t.fats} grams={results.macros.fats.grams} calories={results.macros.fats.calories} percent="20%" color="bg-[#749a76]" example={t.foodExamples.fats} /></div></div>
          </div>}
        </section>

        {hasSavedPlan && <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.75rem] border border-[#26352f]/10 bg-[#fffaf4] p-6 sm:p-8">
            <div className="flex items-start justify-between">
              <div><h2 className="font-display text-3xl font-bold tracking-tight">{t.playbookTitle}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#758077]">{t.playbookIntro || (language === 'my' ? 'အစားအစာတိုင်းကို ခက်ခဲသော စိန်ခေါ်မှုမဖြစ်စေဘဲ ရည်မှန်းချက်ပြည့်မီစေရန် လက်တွေ့နည်းလမ်းများ။' : 'Practical ways to reach your calorie target without making every meal feel difficult.')}</p></div>
              <UtensilsCrossed className="hidden text-[#e56c48] sm:block" size={22} />
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Strategy icon={<Utensils size={18} />} title={t.density || 'ကယ်လိုရီသိပ်သည်းသော အစားအစာရွေးပါ'} text={t.densityText || 'ထမင်း၊ ခေါက်ဆွဲ၊ ထောပတ်သီး၊ မြေပဲထောပတ်နှင့် ကျန်းမာရေးကောင်းသော ဆီများကဲ့သို့ ပမာဏနည်းနည်းဖြင့် ကယ်လိုရီပိုရသော အစားအစာများကို ရွေးပါ။'} onClick={() => setStrategyModal({ title: t.density || 'ကယ်လိုရီသိပ်သည်းသော အစားအစာရွေးပါ', text: t.densityText || 'ထမင်း၊ ခေါက်ဆွဲ၊ ထောပတ်သီး၊ မြေပဲထောပတ်နှင့် ကျန်းမာရေးကောင်းသော ဆီများကဲ့သို့ ပမာဏနည်းနည်းဖြင့် ကယ်လိုရီပိုရသော အစားအစာများကို ရွေးပါ။', examples: t.strategyDetails.density })} /><Strategy icon={<Droplets size={18} />} title={t.liquid} text={t.liquidText} onClick={() => setStrategyModal({ title: t.liquid, text: t.liquidText, examples: t.strategyDetails.liquid })} /><Strategy icon={<Clock3 size={18} />} title={t.window} text={t.windowText} onClick={() => setStrategyModal({ title: t.window, text: t.windowText, examples: t.strategyDetails.window })} /><Strategy icon={<Flame size={18} />} title={t.smaller} text={t.smallerText} onClick={() => setStrategyModal({ title: t.smaller, text: t.smallerText, examples: t.strategyDetails.smaller })} />
            </div>
          </div>
          <div className="rounded-[1.75rem] bg-[#dce7d5] p-6 sm:p-8">
            <div className="flex items-start justify-between"><div><h2 className="font-display text-3xl font-bold tracking-tight">{t.theoryTitle}</h2></div><CircleHelp className="text-[#4c6d50]" size={22} /></div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Definition label="BMR" value={t.bmrMeaning} /><Definition label="TDEE" value={t.tdeeMeaning} />
            </div>
            <div className="mt-6 space-y-4 text-sm text-[#4c6d50]">
              <Formula label={t.womenBmr} value="(10 × weight) + (6.25 × height) − (5 × age) − 161" /><Formula label={t.menBmr} value="(10 × weight) + (6.25 × height) − (5 × age) + 5" /><Formula label={t.tdee} value="BMR × activity multiplier" /><Formula label={t.surplus} value="TDEE × 1.20" /><Formula label={t.macroGrams} value="Protein ÷ 4 · Carbs ÷ 4 · Fats ÷ 9" />
            </div>
          </div>
        </section>}

        {false && savedPlans.length > 0 && <section className="mt-10"><div className="mb-4 flex items-center gap-2"><History size={18} className="text-[#e56c48]" /><h2 className="font-display text-2xl font-bold">{t.saved}</h2><span className="rounded-full bg-[#dce7d5] px-2 py-0.5 text-xs font-bold text-[#4c6d50]">{savedPlans.length}</span></div><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{savedPlans.map((plan) => <div className="rounded-2xl border border-[#26352f]/10 bg-white/65 p-4" key={plan.id}><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold">{plan.name}</p><p className="mt-1 text-xs text-[#758077]">{t.women} {formatNumber(plan.targetWomen || plan.target)} · {t.men} {formatNumber(plan.targetMen || plan.target)} {t.kcal}</p></div><button className="rounded-lg p-2 text-[#a0aaa3] transition hover:bg-[#f5d7c8] hover:text-[#e56c48]" type="button" aria-label={`Delete ${plan.name}`} onClick={() => deletePlan(plan.id)}><Trash2 size={16} /></button></div><button className="button-secondary mt-4 w-full" type="button" onClick={() => viewSavedPlan(plan)}>{t.viewDetails}</button></div>)}</div></section>}

        <footer className="mt-12 flex flex-col gap-2 border-t border-[#26352f]/10 pt-5 text-xs text-[#758077] sm:flex-row sm:items-center sm:justify-between"><p><Check size={14} className="mr-1 inline text-[#749a76]" /> {t.disclaimer}</p><p>{t.savedLocal}</p></footer>
      </div>
      {showGuide && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#26352f]/45 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowGuide(false) }}><section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] bg-[#fffaf4] p-6 shadow-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="guide-title"><div className="flex items-start justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#e56c48]">{t.guideLabel}</p><h2 id="guide-title" className="font-display text-3xl font-bold tracking-tight">{t.guideTitle}</h2></div><button className="rounded-xl p-2 text-[#758077] transition hover:bg-[#f5d7c8] hover:text-[#e56c48]" type="button" aria-label={t.close} onClick={() => setShowGuide(false)}><X size={20} /></button></div><div className="mt-7 grid gap-3 sm:grid-cols-2"><GuideStep number="01" title={language === 'my' ? 'ပရိုဖိုင် ရွေးပါ' : 'Choose a profile'} text={language === 'my' ? 'BMR ဖော်မြူလာအတွက် အမျိုးသမီး သို့မဟုတ် အမျိုးသားကို ရွေးပါ။' : 'Select Women or Men so the personalized result card knows which BMR equation to use.'} /><GuideStep number="02" title={language === 'my' ? 'အချက်အလက် ထည့်ပါ' : 'Enter your details'} text={language === 'my' ? 'ကိုယ်အလေးချိန်၊ အသက်နှင့် အရပ်ကို ထည့်ပါ။ ပေ၊ လက်မကို စင်တီမီတာသို့ အလိုအလျောက် ပြောင်းပေးသည်။' : 'Add weight, age, and height. Height works in centimeters or feet and inches, with automatic CM conversion.'} /><GuideStep number="03" title={language === 'my' ? 'လှုပ်ရှားမှု ရွေးပါ' : 'Set activity'} text={language === 'my' ? 'သင့်ပုံမှန် လှုပ်ရှားမှုနှင့် ကိုက်ညီသော အဆင့်ကို ရွေးပါ။' : 'Choose the activity level that best matches your usual weekly movement.'} /><GuideStep number="04" title={language === 'my' ? 'ရလဒ် ဖတ်ပါ' : 'Read your result'} text={language === 'my' ? 'BMR၊ TDEE နှင့် ၂၀% ပိုလျှံပမာဏကို ကြည့်ပါ။' : 'Review BMR, TDEE, and the 20% surplus target.'} /><GuideStep number="05" title={language === 'my' ? 'စီမံချက် သိမ်းပါ' : 'Save your plan'} text={language === 'my' ? 'အမည်ထည့်ပြီး သိမ်းပါ။ ဤဘရောက်ဆာတွင်သာ သိမ်းထားမည်။' : 'Give the plan an optional name and save it locally in this browser.'} /></div><div className="mt-6 rounded-2xl bg-[#dce7d5] p-4 text-sm leading-6 text-[#4c6d50]"><strong>{t.guideTip}</strong> {t.guideTipText}</div></section></div>}
      {showGuide && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#26352f]/45 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowGuide(false) }}><section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] bg-[#fffaf4] p-6 shadow-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="guide-title"><div className="flex items-start justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#e56c48]">{t.guideLabel}</p><h2 id="guide-title" className="font-display text-3xl font-bold tracking-tight">{t.guideTitle}</h2></div><button className="rounded-xl p-2 text-[#758077] transition hover:bg-[#f5d7c8] hover:text-[#e56c48]" type="button" aria-label={t.close} onClick={() => setShowGuide(false)}><X size={20} /></button></div><div className="mt-7 grid gap-3 sm:grid-cols-2"><GuideStep number="01" title={language === 'my' ? 'ပရိုဖိုင် ရွေးပါ' : 'Choose a profile'} text={language === 'my' ? 'BMR ဖော်မြူလာအတွက် အမျိုးသမီး သို့မဟုတ် အမျိုးသားကို ရွေးပါ။' : 'Select Women or Men so the personalized result card knows which BMR equation to use.'} /><GuideStep number="02" title={language === 'my' ? 'အချက်အလက် ထည့်ပါ' : 'Enter your details'} text={language === 'my' ? 'ကိုယ်အလေးချိန်၊ အသက်နှင့် အရပ်ကို ထည့်ပါ။ ပေ၊ လက်မကို စင်တီမီတာသို့ အလိုအလျောက် ပြောင်းပေးသည်။' : 'Add weight, age, and height. Height works in centimeters or feet and inches, with automatic CM conversion.'} /><GuideStep number="03" title={language === 'my' ? 'လှုပ်ရှားမှု ရွေးပါ' : 'Set activity'} text={language === 'my' ? 'သင့်ပုံမှန် လှုပ်ရှားမှုနှင့် ကိုက်ညီသော အဆင့်ကို ရွေးပါ။' : 'Choose the activity level that best matches your usual weekly movement.'} /><GuideStep number="04" title={language === 'my' ? 'ရလဒ် ဖတ်ပါ' : 'Read your result'} text={language === 'my' ? 'BMR၊ TDEE နှင့် ၂၀% ပိုလျှံပမာဏကို ကြည့်ပါ။' : 'Review BMR, TDEE, and the 20% surplus target.'} /><GuideStep number="05" title={language === 'my' ? 'စီမံချက် သိမ်းပါ' : 'Save your plan'} text={language === 'my' ? 'အမည်ထည့်ပြီး သိမ်းပါ။ ဤဘရောက်ဆာတွင်သာ သိမ်းထားမည်။' : 'Give the plan an optional name and save it locally in this browser.'} /></div><div className="mt-6 rounded-2xl bg-[#dce7d5] p-4 text-sm leading-6 text-[#4c6d50]"><strong>{t.guideTip}</strong> {t.guideTipText}</div></section></div>}
      {showDetails && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#26352f]/45 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowDetails(false) }}><section className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[1.75rem] bg-[#fffaf4] p-6 shadow-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="details-title"><div className="flex items-start justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#e56c48]">{t.save}</p><h2 id="details-title" className="font-display text-3xl font-bold tracking-tight">{t.detailsTitle}</h2></div><button className="rounded-xl p-2 text-[#758077] transition hover:bg-[#f5d7c8] hover:text-[#e56c48]" type="button" aria-label={t.closeDetails} onClick={() => setShowDetails(false)}><X size={20} /></button></div><div className="mt-6 rounded-2xl bg-[#26352f] p-5 text-[#f7f3ed]"><p className="text-sm font-bold text-[#f3a187]">{form.sex === 'female' ? t.women : t.men}</p><p className="mt-3 text-sm text-white/60">{t.tdee}</p><p className="font-display text-4xl font-bold">{formatNumber(form.sex === 'female' ? results.women.tdee : results.men.tdee)} <span className="text-base font-normal text-white/60">{t.kcal}</span></p><p className="mt-4 text-sm text-white/60">{t.target}</p><p className="font-display text-3xl font-bold">{formatNumber(form.sex === 'female' ? results.women.target : results.men.target)} <span className="text-base font-normal text-white/60">{t.kcal}</span></p></div><div className="mt-4 grid grid-cols-3 gap-3"><Macro label={t.protein} grams={results.macros.protein.grams} calories={results.macros.protein.calories} percent="30%" color="bg-[#e56c48]" example={t.foodExamples.protein} /><Macro label={t.carbs} grams={results.macros.carbs.grams} calories={results.macros.carbs.calories} percent="50%" color="bg-[#d5a23c]" example={t.foodExamples.carbs} /><Macro label={t.fats} grams={results.macros.fats.grams} calories={results.macros.fats.calories} percent="20%" color="bg-[#749a76]" example={t.foodExamples.fats} /></div><button className="button-primary mt-6 w-full" type="button" onClick={() => setShowDetails(false)}>{t.viewDetails}</button></section></div>}
      {showDetails && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#26352f]/45 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowDetails(false) }}><section className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[1.75rem] bg-[#fffaf4] p-6 shadow-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="details-title"><div className="flex items-start justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#e56c48]">{t.save}</p><h2 id="details-title" className="font-display text-3xl font-bold tracking-tight">{t.detailsTitle}</h2></div><button className="rounded-xl p-2 text-[#758077] transition hover:bg-[#f5d7c8] hover:text-[#e56c48]" type="button" aria-label={t.closeDetails} onClick={() => setShowDetails(false)}><X size={20} /></button></div><div className="mt-6 rounded-2xl bg-[#26352f] p-5 text-[#f7f3ed]"><p className="text-sm font-bold text-[#f3a187]">{form.sex === 'female' ? t.women : t.men}</p><p className="mt-3 text-sm text-white/60">{t.tdee}</p><p className="font-display text-4xl font-bold">{formatNumber(form.sex === 'female' ? results.women.tdee : results.men.tdee)} <span className="text-base font-normal text-white/60">{t.kcal}</span></p><p className="mt-4 text-sm text-white/60">{t.target}</p><p className="font-display text-3xl font-bold">{formatNumber(form.sex === 'female' ? results.women.target : results.men.target)} <span className="text-base font-normal text-white/60">{t.kcal}</span></p></div><div className="mt-4 grid grid-cols-3 gap-3"><Macro label={t.protein} grams={results.macros.protein.grams} calories={results.macros.protein.calories} percent="30%" color="bg-[#e56c48]" example={t.foodExamples.protein} /><Macro label={t.carbs} grams={results.macros.carbs.grams} calories={results.macros.carbs.calories} percent="50%" color="bg-[#d5a23c]" example={t.foodExamples.carbs} /><Macro label={t.fats} grams={results.macros.fats.grams} calories={results.macros.fats.calories} percent="20%" color="bg-[#749a76]" example={t.foodExamples.fats} /></div><button className="button-primary mt-6 w-full" type="button" onClick={() => setShowDetails(false)}>{t.viewDetails}</button></section></div>}
      {strategyModal && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#26352f]/45 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setStrategyModal(null) }}><section className="w-full max-w-lg rounded-[1.75rem] bg-[#fffaf4] p-6 shadow-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="strategy-title"><div className="flex items-start justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#e56c48]">{t.playbookTitle}</p><h2 id="strategy-title" className="font-display text-3xl font-bold tracking-tight">{strategyModal.title}</h2></div><button className="rounded-xl p-2 text-[#758077] transition hover:bg-[#f5d7c8] hover:text-[#e56c48]" type="button" aria-label={t.closeDetails} onClick={() => setStrategyModal(null)}><X size={20} /></button></div><p className="mt-4 text-sm leading-6 text-[#617068]">{strategyModal.text}</p><ul className="mt-6 space-y-3">{strategyModal.examples.map((example) => <li className="flex gap-3 text-sm leading-6 text-[#4c6d50]" key={example}><Check className="mt-1 shrink-0 text-[#e56c48]" size={16} />{example}</li>)}</ul><button className="button-primary mt-7 w-full" type="button" onClick={() => setStrategyModal(null)}>{t.closeDetails}</button></section></div>}
      {showDetails && <DetailedCalculationBreakdown form={form} result={selectedResult} macros={results.macros} activity={results.activity} language={language} t={t} onClose={() => setShowDetails(false)} />}
    </main>
  )
}

function ProfileResult({ label, result, accent, selected, selectedText, targetText, kcalText }) { return <div className={`rounded-2xl border p-5 ${selected ? 'border-[#e56c48] bg-[#e56c48]/10' : 'border-white/10 bg-white/5'}`}><div className="flex items-center justify-between"><p className={`text-sm font-bold ${accent}`}>{label}</p>{selected && <span className="rounded-full bg-[#e56c48] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">{selectedText}</span>}</div><div className="mt-4 grid grid-cols-2 gap-3"><div><p className="text-[11px] text-white/50">BMR</p><p className="mt-1 font-display text-xl font-bold">{formatNumber(result.bmr)}</p></div><div><p className="text-[11px] text-white/50">TDEE</p><p className="mt-1 font-display text-xl font-bold">{formatNumber(result.tdee)}</p></div></div><div className="mt-4 border-t border-white/10 pt-3"><p className="text-[11px] text-white/50">{targetText}</p><p className="mt-1 font-display text-3xl font-bold">{formatNumber(result.target)} <span className="text-sm font-normal text-white/50">{kcalText}</span></p></div></div> }
function Strategy({ icon, title, text, onClick }) { return <button className="rounded-2xl border border-[#26352f]/10 bg-white p-4 text-left transition hover:-translate-y-0.5 hover:border-[#e56c48]/40 hover:shadow-lg" type="button" onClick={onClick}><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5d7c8] text-[#e56c48]">{icon}</div><h3 className="mt-4 text-sm font-bold">{title}</h3><p className="mt-2 text-xs leading-5 text-[#758077]">{text}</p></button> }
function ProcessStep({ number, text }) { return <div className="flex items-center gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#dce7d5] text-xs font-bold text-[#4c6d50]">{number}</span><span className="text-sm text-[#617068]">{text}</span></div> }
function CalculationBreakdown({ form, result, activity, language, t, onClose }) { const label = language === 'my'; return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#26352f]/55 p-4" role="presentation"><section className="w-full max-w-lg rounded-[1.75rem] bg-[#fffaf4] p-6 shadow-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="calculation-title"><div className="flex items-start justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#e56c48]">{t.save}</p><h2 id="calculation-title" className="font-display text-3xl font-bold tracking-tight">{label ? 'တွက်ချက်မှု အသေးစိတ်' : 'Calculation details'}</h2></div><button className="rounded-xl p-2 text-[#758077] hover:bg-[#f5d7c8]" type="button" aria-label={t.closeDetails} onClick={onClose}><X size={20} /></button></div><p className="mt-2 text-sm text-[#758077]">{label ? 'သင်ထည့်သွင်းထားသော ကိုယ်ရေးအချက်အလက်အပေါ် အခြေခံထားသည်' : 'Based on your entered measurements'}</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl bg-[#dce7d5] p-4"><p className="text-xs text-[#4c6d50]">{label ? 'အခြေခံစွမ်းအင်သုံးစွဲမှု' : 'Basal metabolic rate'}</p><p className="mt-1 font-display text-2xl font-bold">{formatNumber(result.bmr)} {t.kcal}</p></div><div className="rounded-2xl bg-[#dce7d5] p-4"><p className="text-xs text-[#4c6d50]">{label ? 'လှုပ်ရှားမှု မြှောက်ကိန်း' : 'Activity multiplier'}</p><p className="mt-1 font-display text-2xl font-bold">{activity.multiplier || '--'}x</p></div></div><div className="mt-4 rounded-2xl bg-[#26352f] p-5 text-[#f7f3ed]"><p className="text-xs uppercase tracking-[0.15em] text-white/55">{t.tdee}</p><p className="mt-1 font-display text-4xl font-bold">{formatNumber(result.tdee)} <span className="text-base font-normal text-white/55">{t.kcal}</span></p><p className="mt-4 text-xs uppercase tracking-[0.15em] text-white/55">{t.target}</p><p className="mt-1 font-display text-3xl font-bold">{formatNumber(result.target)} <span className="text-base font-normal text-white/55">{t.kcal}</span></p><p className="mt-4 border-t border-white/10 pt-3 text-xs text-white/60">TDEE × 1.20 = {formatNumber(result.target)} {t.kcal}</p></div><p className="mt-5 text-xs leading-5 text-[#758077]">{label ? 'ဤရလဒ်များသည် ခန့်မှန်းချက်များဖြစ်ပြီး သင့်တိုးတက်မှုအပေါ် မူတည်၍ ပြင်ဆင်နိုင်သည်။' : 'These are estimates. Adjust gradually based on your progress, hunger, and how you feel.'}</p><button className="button-primary mt-6 w-full" type="button" onClick={onClose}>{t.closeDetails}</button></section></div> }
function DetailedCalculationBreakdown({ form, result, macros, activity, language, t, onClose }) {
  const isMyanmar = language === 'my'
  const [showFoodDetails, setShowFoodDetails] = useState(false)
  const [foodSearch, setFoodSearch] = useState('')
  const filteredFoods = foodData.filter((food) => `${food.name} ${food.aliases.join(' ')}`.toLowerCase().includes(foodSearch.toLowerCase()))
  const height = getHeightCm(form)
  const profile = form.sex === 'female' ? t.women : t.men
  const equation = form.sex === 'female' ? '(10 × weight) + (6.25 × height) − (5 × age) − 161' : '(10 × weight) + (6.25 × height) − (5 × age) + 5'
  const activityName = t.activityNames[form.activity]
  const inputText = isMyanmar ? `${form.bodyWeight} kg · ${form.age} နှစ် · ${height.toFixed(1)} cm` : `${form.bodyWeight} kg · ${form.age} years · ${height.toFixed(1)} cm`

  return <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-[#26352f]/55 p-4" role="presentation">
    <section className="my-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] bg-[#fffaf4] p-6 shadow-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="detailed-calculation-title">
      <div className="flex items-start justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#e56c48]">{t.save}</p><h2 id="detailed-calculation-title" className="font-display text-3xl font-bold tracking-tight">{isMyanmar ? 'တွက်ချက်မှု အသေးစိတ်' : 'Calculation details'}</h2></div><button className="rounded-xl p-2 text-[#758077] hover:bg-[#f5d7c8]" type="button" aria-label={t.closeDetails} onClick={onClose}><X size={20} /></button></div>
      <p className="mt-2 text-sm text-[#758077]">{isMyanmar ? 'သင်ထည့်သွင်းထားသော အချက်အလက်များမှ တွက်ချက်ထားသည်' : 'A complete breakdown from your entered information'}</p>
      <div className="mt-6 rounded-2xl bg-[#26352f] p-5 text-[#f7f3ed]"><p className="text-sm font-bold text-[#f3a187]">{profile}</p><p className="mt-2 text-xs text-white/55">{inputText}</p><div className="mt-5 grid gap-4 sm:grid-cols-2"><DetailValue label={t.dailyCalories} value={`${formatNumber(result.tdee)} ${t.kcal}`} /><DetailValue label={t.target} value={`${formatNumber(result.target)} ${t.kcal}`} /></div></div><div className="mt-4 rounded-2xl border border-[#26352f]/10 bg-white p-4"><p className="text-xs font-bold uppercase tracking-[0.13em] text-[#e56c48]">{t.dailyCalories}</p><p className="mt-2 text-sm leading-6 text-[#617068]">{t.tdeeInfo}</p></div><div className="mt-4 rounded-2xl border border-[#e56c48]/20 bg-[#f5d7c8]/35 p-4"><p className="text-xs font-bold uppercase tracking-[0.13em] text-[#e56c48]">{t.target}</p><p className="mt-2 text-sm leading-6 text-[#617068]">{t.surplusInfo}</p></div>
      <div className="mt-4"><h3 className="font-display text-2xl font-bold">{t.macroTitle}</h3><div className="mt-3 grid gap-3 sm:grid-cols-3"><Macro label={t.protein} grams={macros.protein.grams} calories={macros.protein.calories} percent="30%" color="bg-[#e56c48]" example={t.foodExamples.protein} /><Macro label={t.carbs} grams={macros.carbs.grams} calories={macros.carbs.calories} percent="50%" color="bg-[#d5a23c]" example={t.foodExamples.carbs} /><Macro label={t.fats} grams={macros.fats.grams} calories={macros.fats.calories} percent="20%" color="bg-[#749a76]" example={t.foodExamples.fats} /></div></div>
      <button className="button-secondary mt-6 w-full" type="button" onClick={() => setShowFoodDetails(true)}>{isMyanmar ? 'အသေးစိတ် ထပ်ကြည့်မည်' : 'More details'}</button><button className="button-primary mt-3 w-full" type="button" onClick={onClose}>{t.closeDetails}</button>
      {showFoodDetails && <div className="fixed inset-0 z-[70] flex items-center justify-center overflow-y-auto bg-[#26352f]/55 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowFoodDetails(false) }}><section className="my-4 max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-[1.75rem] bg-[#fffaf4] p-6 shadow-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="food-details-title"><div className="flex items-start justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#e56c48]">{isMyanmar ? 'အစားအစာဒေတာ' : 'Food database'}</p><h2 id="food-details-title" className="font-display text-3xl font-bold tracking-tight">{isMyanmar ? 'အစားအစာ အာဟာရအသေးစိတ်' : 'Food nutrition details'}</h2></div><button className="rounded-xl p-2 text-[#758077] hover:bg-[#f5d7c8]" type="button" aria-label={t.closeDetails} onClick={() => setShowFoodDetails(false)}><X size={20} /></button></div><input className="field mt-6" value={foodSearch} onChange={(event) => setFoodSearch(event.target.value)} placeholder={isMyanmar ? 'အစားအစာ ရှာဖွေပါ' : 'Search foods'} /><div className="mt-4 space-y-3">{filteredFoods.map((food) => <article className="rounded-2xl border border-[#26352f]/10 bg-white p-4" key={`${food.name}-${food.calories}`}><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h3 className="font-semibold">{food.name}</h3><p className="mt-1 text-xs text-[#758077]">{isMyanmar ? 'စားသုံးပမာဏ' : 'Serving'}: {food.name.match(/\((.*)\)/)?.[1] || 'listed serving'}</p></div><strong className="font-display text-2xl text-[#e56c48]">{food.calories} <span className="text-sm font-normal text-[#758077]">{isMyanmar ? 'ကယ်လိုရီ' : 'kcal'}</span></strong></div><div className="mt-3 grid grid-cols-3 gap-2 text-xs"><NutritionValue label={isMyanmar ? 'ပရိုတင်း' : 'Protein'} value={`${food.protein}g`} /><NutritionValue label={isMyanmar ? 'ကာဗိုဟိုက်ဒရိတ်' : 'Carbs'} value={`${food.carbs}g`} /><NutritionValue label={isMyanmar ? 'အဆီ' : 'Fat'} value={`${food.fat}g`} /></div></article>)}</div>{filteredFoods.length === 0 && <p className="py-8 text-center text-sm text-[#758077]">{isMyanmar ? 'အစားအစာ မတွေ့ပါ။' : 'No foods found.'}</p>}<button className="button-primary mt-6 w-full" type="button" onClick={() => setShowFoodDetails(false)}>{t.closeDetails}</button></section></div>}
    </section>
  </div>
}
function DetailValue({ label, value }) { return <div><p className="text-xs text-white/55">{label}</p><p className="mt-1 font-display text-xl font-bold">{value}</p></div> }
function NutritionValue({ label, value }) { return <div className="rounded-lg bg-[#f7f3ed] p-2"><p className="text-[#758077]">{label}</p><p className="mt-1 font-bold text-[#26352f]">{value}</p></div> }
function DetailPanel({ label, value }) { return <div className="rounded-2xl border border-[#26352f]/10 bg-white p-4"><p className="text-xs text-[#758077]">{label}</p><p className="mt-1 text-sm font-bold text-[#26352f]">{value}</p></div> }
function Formula({ label, value }) { return <div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#4c6d50]/70">{label}</p><p className="mt-1 font-display text-base font-semibold text-[#26352f]">{value}</p></div> }
function Definition({ label, value }) { return <div className="rounded-2xl border border-[#4c6d50]/15 bg-white/45 p-4"><p className="text-sm font-bold text-[#26352f]">{label}</p><p className="mt-1 text-xs leading-5 text-[#4c6d50]">{value}</p></div> }
function GuideStep({ number, title, text }) { return <article className="rounded-2xl border border-[#26352f]/10 bg-white p-4"><p className="text-xs font-bold tracking-[0.14em] text-[#e56c48]">{number}</p><h3 className="mt-3 text-sm font-bold text-[#26352f]">{title}</h3><p className="mt-2 text-xs leading-5 text-[#758077]">{text}</p></article> }
function Macro({ label, grams, calories, percent, color, example }) { return <div className="rounded-2xl border border-[#26352f]/10 bg-white p-4"><div className={`mb-4 h-1.5 w-10 rounded-full ${color}`} /><p className="text-sm font-semibold">{label}</p><p className="mt-1 font-display text-2xl font-bold">{formatNumber(grams)}<span className="ml-1 text-sm font-normal text-[#758077]">g</span></p><p className="mt-1 text-xs text-[#758077]">{percent} · {formatNumber(calories)} kcal</p><p className="mt-3 border-t border-[#26352f]/10 pt-3 text-[11px] leading-4 text-[#758077]"><span className="font-bold text-[#26352f]">Example:</span> {example}</p></div> }

export default App
