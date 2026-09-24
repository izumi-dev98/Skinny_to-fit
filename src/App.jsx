import { useEffect, useMemo, useState } from 'react'
import Swal from 'sweetalert2'
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

function App() {
  const [form, setForm] = useState(initialForm)
  const [showGuide, setShowGuide] = useState(false)
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

  return (
    <main className="min-h-screen overflow-hidden bg-[#f7f3ed] text-[#26352f]">
      <div className="pointer-events-none absolute left-[-8rem] top-[-8rem] h-72 w-72 rounded-full bg-[#f5d7c8] opacity-70 blur-3xl" />
      <div className="pointer-events-none absolute right-[-6rem] top-32 h-96 w-96 rounded-full bg-[#dce7d5] opacity-70 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-6 sm:px-8 lg:px-12">
        <header className="flex items-center justify-between border-b border-[#26352f]/10 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#26352f] text-[#f7f3ed] shadow-lg shadow-[#26352f]/10"><Sparkles size={18} /></div>
            <div>
              <p className="font-display text-lg font-semibold tracking-tight">Skinny to Fit</p>
             
            </div>
          </div>
         
          <button className="button-secondary px-3 sm:px-4" type="button" aria-label="How to use this project" onClick={() => setShowGuide(true)}><CircleHelp size={16} /><span className="hidden sm:inline">How to use this project</span></button>
        </header>

        <section className="grid gap-10 pb-10 pt-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end lg:pt-20">
          <div className="max-w-xl animate-rise">
            <div className="mb-5 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#e56c48]"><span className="h-px w-8 bg-[#e56c48]" /> Daily fuel planner</div>
            <h1 className="font-display text-5xl font-bold leading-[0.98] tracking-[-0.04em] text-[#26352f] sm:text-7xl">Eat with a little more <em className="font-editorial font-normal text-[#e56c48]">intention.</em></h1>
           
          </div>
          
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <form className="rounded-[1.75rem] border border-[#26352f]/10 bg-white/80 p-6 shadow-[0_24px_70px_rgba(38,53,47,0.08)] backdrop-blur sm:p-8" onSubmit={(event) => { event.preventDefault(); savePlan() }}>
            <div className="mb-8 flex items-start justify-between"><div><h2 className="font-display text-3xl font-bold tracking-tight">Tell us about you</h2></div><div className="rounded-full bg-[#f7f3ed] p-3 text-[#e56c48]"><Activity size={20} /></div></div>
            <label className="field-label">Plan name <span className="font-normal text-[#a0aaa3]">(optional)</span><input className="field" value={form.name} onChange={(event) => updateForm('name', event.target.value)} placeholder="e.g. My summer reset" /></label>
            <fieldset className="mt-5"><legend className="field-label">Calculate for</legend><div className="grid grid-cols-2 gap-2 rounded-xl bg-[#f7f3ed] p-1"><button type="button" className={`choice ${form.sex === 'female' ? 'choice-active' : ''}`} onClick={() => updateForm('sex', 'female')}>Women</button><button type="button" className={`choice ${form.sex === 'male' ? 'choice-active' : ''}`} onClick={() => updateForm('sex', 'male')}>Men</button></div></fieldset>
            <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="field-label">Weight <span>(kg)</span><input className="field" type="number" min="1" step="0.1" value={form.bodyWeight} onChange={(event) => updateForm('bodyWeight', event.target.value)} placeholder="Your weight" /></label><label className="field-label">Age <span>(years)</span><input className="field" type="number" min="13" step="1" value={form.age} onChange={(event) => updateForm('age', event.target.value)} placeholder="Your age" /></label></div>
            <fieldset className="mt-5"><legend className="field-label">Height</legend><div className="mb-2 grid grid-cols-2 gap-2 rounded-xl bg-[#f7f3ed] p-1"><button type="button" className={`choice ${form.heightUnit === 'cm' ? 'choice-active' : ''}`} onClick={() => updateForm('heightUnit', 'cm')}>Centimeters</button><button type="button" className={`choice ${form.heightUnit === 'ft' ? 'choice-active' : ''}`} onClick={() => updateForm('heightUnit', 'ft')}>Feet + inches</button></div>{form.heightUnit === 'cm' ? <input className="field" type="number" min="50" step="0.1" value={form.heightCm} onChange={(event) => updateForm('heightCm', event.target.value)} placeholder="Height in centimeters" /> : <><div className="grid grid-cols-2 gap-3"><label className="field-label">Feet<input className="field" type="number" min="1" max="8" step="1" value={form.heightFeet} onChange={(event) => updateForm('heightFeet', event.target.value)} placeholder="5" /></label><label className="field-label">Inches<input className="field" type="number" min="0" max="11" step="0.1" value={form.heightInches} onChange={(event) => updateForm('heightInches', event.target.value)} placeholder="5" /></label></div><div className="mt-3 flex items-center justify-between rounded-xl bg-[#dce7d5] px-4 py-3"><span className="text-xs font-bold uppercase tracking-[0.12em] text-[#4c6d50]">Converted height</span><strong className="font-display text-xl text-[#26352f]">{getHeightCm(form) ? `${getHeightCm(form).toFixed(1)} cm` : '-- cm'}</strong></div></>}<p className="mt-2 text-xs font-normal normal-case tracking-normal text-[#a0aaa3]">Feet and inches are automatically converted to centimeters for the formula.</p></fieldset>
            <label className="field-label mt-5">Activity level<div className="relative"><select className="field appearance-none pr-10" value={form.activity} onChange={(event) => updateForm('activity', event.target.value)}><option value="">Select your activity level</option>{activityLevels.map((item) => <option key={item.value} value={item.value}>{item.label} · {item.detail}</option>)}</select><ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#758077]" size={18} /></div></label>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row"><button className="button-primary flex-1" type="submit"><Bookmark size={17} /> Save plan</button><button className="button-secondary" type="button" onClick={resetForm}><RotateCcw size={16} /> Reset</button></div>
          </form>

          <div className="space-y-6">
            <div className="rounded-[1.75rem] bg-[#26352f] p-6 text-[#f7f3ed] shadow-[0_24px_70px_rgba(38,53,47,0.18)] sm:p-8">
              <div className="flex items-start justify-between"><div><h2 className="font-display text-3xl font-bold tracking-tight">A useful starting point</h2></div><Flame className="text-[#f3a187]" size={24} /></div>
              <div className="mt-8">{form.sex ? <ProfileResult label={form.sex === 'female' ? 'Women' : 'Men'} result={form.sex === 'female' ? results.women : results.men} accent={form.sex === 'female' ? 'text-[#f3a187]' : 'text-[#dce7d5]'} selected /> : <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-8 text-center"><p className="font-display text-2xl font-semibold text-white/80">Choose Women or Men</p><p className="mt-2 text-sm text-white/50">Your BMR, TDEE, and surplus target will appear here.</p></div>}</div>
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-5"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-white/55">{form.sex ? 'Your personalized target' : 'Ready when you are'}</p><p className="mt-1 text-sm text-white/75">{form.sex ? 'This target adds 20% to your TDEE. Adjust it based on your progress and how you feel.' : 'Choose Women or Men above to calculate your daily target.'}</p></div><ArrowRight className="shrink-0 text-[#f3a187]" size={25} /></div>
            </div>
            <div className="rounded-[1.75rem] border border-[#26352f]/10 bg-[#fffaf4] p-6 sm:p-8"><div className="flex items-start justify-between"><div><h2 className="font-display text-3xl font-bold tracking-tight">A simple daily split</h2></div><Utensils className="text-[#758077]" size={22} /></div><div className="mt-6 grid gap-3 sm:grid-cols-3"><Macro label="Protein" grams={results.macros.protein.grams} calories={results.macros.protein.calories} percent="30%" color="bg-[#e56c48]" /><Macro label="Carbs" grams={results.macros.carbs.grams} calories={results.macros.carbs.calories} percent="50%" color="bg-[#d5a23c]" /><Macro label="Fats" grams={results.macros.fats.grams} calories={results.macros.fats.calories} percent="20%" color="bg-[#749a76]" /></div></div>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.75rem] border border-[#26352f]/10 bg-[#fffaf4] p-6 sm:p-8">
            <div className="flex items-start justify-between">
              <div><h2 className="font-display text-3xl font-bold tracking-tight">Make extra calories feel easier</h2><p className="mt-2 max-w-xl text-sm leading-6 text-[#758077]">A few practical ways to reach your target without turning every meal into a challenge.</p></div>
              <UtensilsCrossed className="hidden text-[#e56c48] sm:block" size={22} />
            </div>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              <Strategy icon={<Utensils size={18} />} title="Choose calorie density" text="Use compact staples like rice, pasta, avocado, peanut butter, and cooking oils before filling up on bulky low-calorie foods." />
              <Strategy icon={<Droplets size={18} />} title="Drink some calories" text="A smoothie with whole milk, banana, peanut butter, oats, and protein powder can add 500–600 calories comfortably." />
              <Strategy icon={<Clock3 size={18} />} title="Use a meal window" text="Give a substantial meal 15–20 minutes of calm, unrushed eating, then pause and check how comfortably full you feel." />
              <Strategy icon={<Flame size={18} />} title="Make meals smaller" text="Split your daily intake across 5 or 6 manageable meals to keep digestion comfortable and energy steady." />
            </div>
          </div>
          <div className="rounded-[1.75rem] bg-[#dce7d5] p-6 sm:p-8">
            <div className="flex items-start justify-between"><div><h2 className="font-display text-3xl font-bold tracking-tight">How The Theory Work</h2></div><CircleHelp className="text-[#4c6d50]" size={22} /></div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Definition label="BMR" value="Basal Metabolic Rate: the energy your body uses at rest for essential functions." />
              <Definition label="TDEE" value="Total Daily Energy Expenditure: your estimated daily energy use including activity." />
            </div>
            <div className="mt-6 space-y-4 text-sm text-[#4c6d50]">
              <Formula label="Women’s BMR" value="(10 × weight) + (6.25 × height) − (5 × age) − 161" />
              <Formula label="Men’s BMR" value="(10 × weight) + (6.25 × height) − (5 × age) + 5" />
              <Formula label="TDEE" value="BMR × activity multiplier" />
              <Formula label="Surplus target" value="TDEE × 1.20" />
              <Formula label="Macro grams" value="Protein ÷ 4 · Carbs ÷ 4 · Fats ÷ 9" />
            </div>
            <p className="mt-6 border-t border-[#4c6d50]/15 pt-4 text-xs leading-5 text-[#4c6d50]/75">The macro panel uses the women’s surplus target and the 30% protein, 50% carbohydrate, and 20% fat split from your theory.</p>
          </div>
        </section>

        {savedPlans.length > 0 && <section className="mt-10"><div className="mb-4 flex items-center gap-2"><History size={18} className="text-[#e56c48]" /><h2 className="font-display text-2xl font-bold">Saved plans</h2><span className="rounded-full bg-[#dce7d5] px-2 py-0.5 text-xs font-bold text-[#4c6d50]">{savedPlans.length}</span></div><div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">{savedPlans.map((plan) => <div className="flex items-center justify-between rounded-2xl border border-[#26352f]/10 bg-white/65 p-4" key={plan.id}><button className="min-w-0 text-left" type="button" onClick={() => loadPlan(plan)}><p className="truncate font-semibold">{plan.name}</p><p className="mt-1 text-xs text-[#758077]">Women {formatNumber(plan.targetWomen || plan.target)} · Men {formatNumber(plan.targetMen || plan.target)} kcal</p></button><button className="ml-3 rounded-lg p-2 text-[#a0aaa3] transition hover:bg-[#f5d7c8] hover:text-[#e56c48]" type="button" aria-label={`Delete ${plan.name}`} onClick={() => deletePlan(plan.id)}><Trash2 size={16} /></button></div>)}</div></section>}

        <footer className="mt-12 flex flex-col gap-2 border-t border-[#26352f]/10 pt-5 text-xs text-[#758077] sm:flex-row sm:items-center sm:justify-between"><p><Check size={14} className="mr-1 inline text-[#749a76]" /> Calculations are estimates, not medical advice.</p><p>Saved locally on this device.</p></footer>
      </div>
      {showGuide && <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#26352f]/45 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowGuide(false) }}><section className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[1.75rem] bg-[#fffaf4] p-6 shadow-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="guide-title"><div className="flex items-start justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#e56c48]">Project guide</p><h2 id="guide-title" className="font-display text-3xl font-bold tracking-tight">How to use this project</h2></div><button className="rounded-xl p-2 text-[#758077] transition hover:bg-[#f5d7c8] hover:text-[#e56c48]" type="button" aria-label="Close project guide" onClick={() => setShowGuide(false)}><X size={20} /></button></div><div className="mt-7 grid gap-3 sm:grid-cols-2"><GuideStep number="01" title="Choose a profile" text="Select Women or Men so the personalized result card knows which BMR equation to use." /><GuideStep number="02" title="Enter your details" text="Add weight, age, and height. Height works in centimeters or feet and inches, with automatic CM conversion." /><GuideStep number="03" title="Set activity" text="Choose the activity level that best matches your usual weekly movement." /><GuideStep number="04" title="Read your result" text="Review BMR, TDEE, and the 20% surplus target. The macro panel uses the women’s surplus split from the theory." /><GuideStep number="05" title="Save your plan" text="Give the plan an optional name and press Save plan. It stays in this browser using localStorage." /></div><div className="mt-6 rounded-2xl bg-[#dce7d5] p-4 text-sm leading-6 text-[#4c6d50]"><strong>Tip:</strong> Treat the result as a starting estimate. Track progress and adjust food intake gradually.</div></section></div>}
    </main>
  )
}

function ProfileResult({ label, result, accent, selected }) { return <div className={`rounded-2xl border p-5 ${selected ? 'border-[#e56c48] bg-[#e56c48]/10' : 'border-white/10 bg-white/5'}`}><div className="flex items-center justify-between"><p className={`text-sm font-bold ${accent}`}>{label}</p>{selected && <span className="rounded-full bg-[#e56c48] px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Selected</span>}</div><div className="mt-4 grid grid-cols-2 gap-3"><div><p className="text-[11px] text-white/50">BMR</p><p className="mt-1 font-display text-xl font-bold">{formatNumber(result.bmr)}</p></div><div><p className="text-[11px] text-white/50">TDEE</p><p className="mt-1 font-display text-xl font-bold">{formatNumber(result.tdee)}</p></div></div><div className="mt-4 border-t border-white/10 pt-3"><p className="text-[11px] text-white/50">20% surplus target</p><p className="mt-1 font-display text-3xl font-bold">{formatNumber(result.target)} <span className="text-sm font-normal text-white/50">kcal</span></p></div></div> }
function Strategy({ icon, title, text }) { return <article className="rounded-2xl border border-[#26352f]/10 bg-white p-4"><div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#f5d7c8] text-[#e56c48]">{icon}</div><h3 className="mt-4 text-sm font-bold">{title}</h3><p className="mt-2 text-xs leading-5 text-[#758077]">{text}</p></article> }
function Formula({ label, value }) { return <div><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#4c6d50]/70">{label}</p><p className="mt-1 font-display text-base font-semibold text-[#26352f]">{value}</p></div> }
function Definition({ label, value }) { return <div className="rounded-2xl border border-[#4c6d50]/15 bg-white/45 p-4"><p className="text-sm font-bold text-[#26352f]">{label}</p><p className="mt-1 text-xs leading-5 text-[#4c6d50]">{value}</p></div> }
function GuideStep({ number, title, text }) { return <article className="rounded-2xl border border-[#26352f]/10 bg-white p-4"><p className="text-xs font-bold tracking-[0.14em] text-[#e56c48]">{number}</p><h3 className="mt-3 text-sm font-bold text-[#26352f]">{title}</h3><p className="mt-2 text-xs leading-5 text-[#758077]">{text}</p></article> }
function Macro({ label, grams, calories, percent, color }) { return <div className="rounded-2xl border border-[#26352f]/10 bg-white p-4"><div className={`mb-4 h-1.5 w-10 rounded-full ${color}`} /><p className="text-sm font-semibold">{label}</p><p className="mt-1 font-display text-2xl font-bold">{formatNumber(grams)}<span className="ml-1 text-sm font-normal text-[#758077]">g</span></p><p className="mt-1 text-xs text-[#758077]">{percent} · {formatNumber(calories)} kcal</p></div> }

export default App
