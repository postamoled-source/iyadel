// Detailed step-by-step usage guides for each tool (English).
// Arabic equivalents live in src/data/translations-ar.js under TOOL_GUIDES_AR.

export const TOOL_GUIDES = {
  "loan-calculator": {
    intro: "Estimate the true cost of a loan in three quick fields. The result helps you budget, compare offers, and decide whether extra payments are worth it.",
    steps: [
      "Enter the Loan Amount — the total you plan to borrow (for example 10000).",
      "Enter the Annual Rate (%) — the yearly interest rate quoted by the bank (for example 6.5).",
      "Enter the Term (Months) — how long you will take to repay (for example 36).",
      "Press Calculate Loan to reveal your monthly payment, total interest, and total amount repaid.",
    ],
    tips: [
      "Compare the same term across several banks — the monthly payment can differ even when the rate looks similar.",
      "Making extra payments early reduces the principal faster and cuts total interest significantly.",
      "Ask the bank about hidden fees or insurance added to the principal — they are not captured by the rate alone.",
    ],
  },
  "simple-compound-interest": {
    intro: "See how a deposit grows under simple versus compound interest, and how compounding frequency changes the outcome.",
    steps: [
      "Enter the Principal Amount — your initial deposit.",
      "Enter the Interest Rate (%) — the yearly rate offered.",
      "Enter the Duration (Years) — how long the money stays invested.",
      "Choose a Compound Frequency — Yearly, Semi-annual, Quarterly, Monthly, or Daily.",
      "Press Calculate Interest to compare simple and compound earnings side by side.",
    ],
    tips: [
      "More frequent compounding grows your money faster — Daily beats Yearly for the same rate.",
      "The gap between simple and compound widens dramatically over long durations.",
      "Use the comparison to decide between savings products that quote different compounding rules.",
    ],
  },
  "bond-yield": {
    intro: "Measure a bond's current yield and its yield to maturity (YTM) from four basic figures.",
    steps: [
      "Enter the Face Value ($) — the amount repaid at maturity, usually 1000.",
      "Enter the Current Price ($) — what the bond trades for today.",
      "Enter the Annual Coupon ($) — the yearly interest payment.",
      "Enter the Years to Maturity — time remaining until the bond matures.",
      "Press Calculate Yield to see both current yield and YTM.",
    ],
    tips: [
      "Current Yield = Annual Coupon ÷ Price — a quick income snapshot.",
      "YTM accounts for any gain or loss if you buy below or above face value.",
      "Compare YTM across bonds of similar risk to judge which is better priced.",
    ],
  },
  "bmi-calculator": {
    intro: "Get a quick BMI reading and its weight classification from your weight and height.",
    steps: [
      "Enter your Weight in kilograms (for example 70).",
      "Enter your Height in centimeters (for example 175).",
      "The BMI value and classification (Underweight / Normal / Overweight / Obese) appear instantly.",
    ],
    tips: [
      "BMI does not separate muscle from fat — very muscular people may read as overweight.",
      "Use BMI as a starting point alongside waist circumference and body-fat percentage.",
      "Track the trend over time rather than fixating on a single number.",
    ],
  },
  "calories-burned": {
    intro: "Estimate calories burned for an activity using standard MET values.",
    steps: [
      "Enter your Weight in kilograms.",
      "Enter the Duration of the activity in minutes.",
      "Select an Activity — Walking, Running, Cycling, Swimming, Weight Lifting, or Yoga.",
      "The estimated calories burned appear immediately.",
    ],
    tips: [
      "Heavier bodies burn more calories for the same activity.",
      "Higher-intensity activities have higher MET values and burn more per minute.",
      "Treat the result as an estimate — actual burn varies with fitness and effort.",
    ],
  },
  "currency-converter": {
    intro: "Convert an amount between 166 world currencies using live exchange rates.",
    steps: [
      "Enter the Amount you want to convert.",
      "Pick the From currency.",
      "Pick the To currency.",
      "Press Convert Currency (or Swap to reverse the direction).",
    ],
    tips: [
      "Rates are fetched live and update with each refresh.",
      "For large transfers, confirm the rate and any fees with your provider.",
      "Use Swap to quickly check the reverse conversion.",
    ],
  },
  "distance-converter": {
    intro: "Convert a distance between metric and imperial units.",
    steps: [
      "Enter the Value to convert.",
      "Pick the From unit (Mile, Kilometer, Yard, Meter, ...).",
      "Pick the To unit.",
      "The converted result appears instantly.",
    ],
    tips: [
      "All conversions pass through meters as the base unit for accuracy.",
      "Useful for travel, mapping, and engineering across mixed unit systems.",
      "Results show up to six decimal places for very small values.",
    ],
  },
  "weight-converter": {
    intro: "Convert a weight between grams, kilograms, pounds, ounces, and tons.",
    steps: [
      "Enter the Value to convert.",
      "Pick the From unit.",
      "Pick the To unit.",
      "The converted result appears instantly.",
    ],
    tips: [
      "Conversions go through grams as the common reference for precision.",
      "Handy for cooking, shipping, and fitness tracking.",
      "Avoid rounding intermediate values to prevent cumulative error.",
    ],
  },
  "area-converter": {
    intro: "Convert surface area between square meters, square feet, acres, hectares, and more.",
    steps: [
      "Enter the Value to convert.",
      "Pick the From unit.",
      "Pick the To unit.",
      "The converted result appears instantly.",
    ],
    tips: [
      "1 hectare is roughly 2.47 acres — a big difference when comparing land.",
      "All conversions use square meters as the base for consistency.",
      "Useful for real estate and agriculture where units often mix.",
    ],
  },
  "time-converter": {
    intro: "Convert a duration between days, hours, minutes, seconds, and milliseconds.",
    steps: [
      "Enter the Value to convert.",
      "Pick the From unit.",
      "Pick the To unit.",
      "The converted result appears instantly.",
    ],
    tips: [
      "Time uses a non-decimal system — a tool avoids mental-conversion errors.",
      "Seconds act as the base unit for precision down to the millisecond.",
      "Great for scheduling, durations, and media timestamps.",
    ],
  },
  "speed-converter": {
    intro: "Convert a speed between km/h, mph, m/s, and knots.",
    steps: [
      "Enter the Value to convert.",
      "Pick the From unit.",
      "Pick the To unit.",
      "The converted result appears instantly.",
    ],
    tips: [
      "km/h is standard in most countries; mph in the US and UK.",
      "Knots are used in aviation and maritime contexts.",
      "m/s is the SI unit common in physics and engineering.",
    ],
  },
  "internet-speed-test": {
    intro: "Measure your connection's ping, download, and upload speeds.",
    steps: [
      "Close bandwidth-heavy apps and streams for an accurate reading.",
      "Press Start Speed Test.",
      "Watch the Ping, Download, and Upload values fill in as the test runs.",
    ],
    tips: [
      "Ping matters most for gaming and video calls (lower is better).",
      "Download speed affects streaming and loading; upload affects sending files.",
      "Run the test a few times and average the results for a stable estimate.",
    ],
  },
  "qr-code-generator": {
    intro: "Encode text or a URL into a downloadable QR code image.",
    steps: [
      "Type or paste your Text or URL into the field.",
      "A QR code image appears immediately.",
      "Click Download to save it as a PNG.",
    ],
    tips: [
      "QR codes work great for menus, payments, business cards, and packaging.",
      "Your data is encoded on demand and never stored — fully private.",
      "Keep the target URL short for a cleaner, easier-to-scan code.",
    ],
  },
  "share-link-generator": {
    intro: "Build ready-to-use share URLs for major social platforms.",
    steps: [
      "Paste your Page URL.",
      "Optionally add a Message to pre-fill the share text.",
      "Click any of the generated links (Facebook, Twitter, LinkedIn, WhatsApp) to open that platform's share dialog.",
    ],
    tips: [
      "Each platform expects a slightly different URL format — this handles it for you.",
      "Use these links in emails, websites, or messages to encourage sharing.",
      "The message is optional but boosts click-through on social posts.",
    ],
  },
  "privacy-policy-generator": {
    intro: "Generate a structured privacy policy from your app name, site URL, and contact email.",
    steps: [
      "Enter your App Name.",
      "Enter your Site URL.",
      "Enter your Contact Email.",
      "Press Generate Policy, then review and Copy the text.",
    ],
    tips: [
      "Covers standard sections — data collection, usage, cookies, and user rights.",
      "Review the output with a legal professional for your specific jurisdiction.",
      "Keep the policy updated as your data-handling practices change.",
    ],
  },
  "coupon-code-generator": {
    intro: "Create batches of random, copy-ready promo codes.",
    steps: [
      "Set the Number of Codes and the Code Length.",
      "Optionally add a Prefix and a Dash-every-N value to group characters.",
      "Pick a Character Set — Alphanumeric (default), Letters, Numbers, or Hex.",
      "Press Generate Coupons, then Copy All or copy individual codes.",
    ],
    tips: [
      "The default set excludes easily-confused characters (O, I, 0, 1).",
      "Use dashes to break long codes into readable groups.",
      "Generate extra codes beyond your campaign size to cover wastage.",
    ],
  },
  "math-function-calculator": {
    intro: "Plot a mathematical function across a range of x values.",
    steps: [
      "Type an expression for f(x), for example sin(x) or x^2 - 1.",
      "Supported functions: sin, cos, tan, sqrt, ln, log, exp, abs, and the power operator ^.",
      "Press Plot Function to draw the graph.",
    ],
    tips: [
      "Use the plot to spot roots, maxima, minima, and asymptotes.",
      "Combine functions, e.g. sin(x) * exp(-x), to explore behavior.",
      "Great for study, teaching, and checking homework.",
    ],
  },
  "percentage-calculator": {
    intro: "Handle three common percentage tasks in one tool.",
    steps: [
      "Choose a Calculation Type: 'of' (A% of B), 'isWhat' (A is what % of B), or 'change' (% change from A to B).",
      "Enter Value A and Value B.",
      "The result appears instantly.",
    ],
    tips: [
      "'of' returns a value; the other two return a percentage.",
      "Percentage change is ideal for comparing growth or decline over time.",
      "Double-check the mode to avoid confusing 'percent of' with 'percent of what'.",
    ],
  },
  "physics-calculators": {
    intro: "Solve basic motion and electricity equations.",
    steps: [
      "Choose a Calculation: speed, distance, time, or ohm.",
      "Enter the two known values in the fields that appear.",
      "The third value is calculated and displayed.",
    ],
    tips: [
      "speed = distance ÷ time, distance = speed × time, time = distance ÷ speed.",
      "Ohm's Law: I = V ÷ R (current = voltage ÷ resistance).",
      "Make sure all inputs use consistent units (meters, seconds, volts, ohms).",
    ],
  },
  "chemistry-calculators": {
    intro: "Calculate the molar mass of a compound from its chemical formula.",
    steps: [
      "Type a Chemical Formula, for example H2O, NaCl, or C6H12O6.",
      "The molar mass in g/mol appears instantly if the formula is valid.",
    ],
    tips: [
      "Use standard element symbols with counts (H2O, not h2o).",
      "Supports the most common elements; add exotic ones via their atomic weights.",
      "Essential for converting between grams and moles in lab work.",
    ],
  },
  "riddle-game": {
    intro: "Test your lateral thinking with a random riddle.",
    steps: [
      "Read the riddle shown in the panel.",
      "Type your answer in the field.",
      "Press Submit Answer — you have 3 attempts.",
      "Press New Riddle for another challenge.",
    ],
    tips: [
      "Think laterally — the answer is often something everyday described indirectly.",
      "Use all three attempts before giving up.",
      "Great for warming up your brain or a quick group challenge.",
    ],
  },
  "math-puzzle": {
    intro: "Sharpen mental math with randomized arithmetic problems.",
    steps: [
      "Pick a Difficulty: Easy, Medium, Hard, or Expert.",
      "Read the problem in the panel.",
      "Type your answer and press Check.",
      "Press Next Puzzle for a fresh question.",
    ],
    tips: [
      "Higher difficulties add larger numbers and more steps.",
      "Each puzzle generates a fresh question, so you can practice endlessly.",
      "Regular practice improves working memory and calculation speed.",
    ],
  },
  "word-scramble": {
    intro: "Unscramble a jumbled word back to its original form.",
    steps: [
      "Look at the scrambled letters in the panel.",
      "Type the unscrambled word.",
      "Press Check to verify, or New Word for a different scramble.",
    ],
    tips: [
      "The scrambled result is never identical to the original word.",
      "Look for common prefixes or suffixes as starting points.",
      "Builds pattern recognition, spelling, and vocabulary.",
    ],
  },
  "image-cropper": {
    intro: "Crop any image to a centered square, ideal for avatars and thumbnails.",
    steps: [
      "Click the file picker and choose an image.",
      "Preview the uploaded image.",
      "Press Crop to Square.",
      "Download the result as a PNG.",
    ],
    tips: [
      "Cropping happens in your browser — your image is never uploaded.",
      "A centered square works best for profile pictures.",
      "Use a high-resolution source to keep the cropped result sharp.",
    ],
  },
  "background-remover": {
    intro: "Remove a solid background color and make it transparent.",
    steps: [
      "Upload an image with a solid, uniform background.",
      "Preview the image, then press Remove Background.",
      "Download the result as a transparent PNG.",
    ],
    tips: [
      "Works best with a solid background and a clearly contrasting subject.",
      "All processing is local — your images stay private.",
      "A checkerboard preview shows transparency behind the subject.",
    ],
  },
  "image-to-pdf": {
    intro: "Combine multiple images into a single multi-page PDF.",
    steps: [
      "Select one or more images from the file picker.",
      "Review the thumbnails of added images.",
      "Press Create PDF — each image becomes a page.",
      "The PDF downloads automatically.",
    ],
    tips: [
      "Everything runs in your browser — images never leave your device.",
      "Each image is centered and scaled to fit its page.",
      "Produces a standard PDF you can open on any device.",
    ],
  },
  "image-compressor": {
    intro: "Reduce an image's file size by adjusting JPEG quality.",
    steps: [
      "Upload the image you want to compress.",
      "Pick a Quality level (0.9 is high, 0.3 is aggressive).",
      "Press Compress.",
      "Compare the before/after sizes and download the result.",
    ],
    tips: [
      "Lower quality means a smaller file but more visible artifacts.",
      "0.7 is a good balance for web use.",
      "Compression happens locally, so your image stays private.",
    ],
  },
  "image-enhancer": {
    intro: "Improve any photo with one-tap presets or manual sliders, then download the result.",
    steps: [
      "Click the file picker and choose an image.",
      "Try a preset (Auto, Vivid, B&W, Warm, Soft) or drag the Brightness, Contrast, Saturation, Sharpness, and Dehaze sliders — the preview updates live.",
      "Use Reset to clear all adjustments.",
      "Press Download to save the enhanced image as a PNG.",
    ],
    tips: [
      "All processing is local — your image is never uploaded.",
      "Presets are a quick starting point; fine-tune with the sliders.",
      "A little sharpening goes a long way — too much creates halos around edges.",
    ],
  },
  "logo-maker": {
    intro: "Design a custom logo live on a canvas with templates, icons, fonts, and brand colors, or generate several AI concepts from your brand name.",
    steps: [
      "Enter your Brand Name and an optional Tagline.",
      "Pick a Template — Minimalist, Badge, Modern, Emblem, or Bold.",
      "Choose an Icon, a Font, and your Primary and Accent colors.",
      "Watch the preview update live as you change any field.",
      "Press Download Logo to save a transparent PNG.",
      "Or press Generate AI Logos to create several AI concepts at once.",
      "Click any AI slot to preview it, then Download the one you like.",
    ],
    tips: [
      "Keep the brand name short for the cleanest layout.",
      "Match the accent color to your brand palette for consistency.",
      "Try several templates — each suits a different brand feel.",
      "AI concepts are original ideas to inspire you — text in them may vary, so refine your favorite in the canvas if needed.",
    ],
  },
  "whack-a-mole": {
    intro: "Tap the moles as they pop up from their holes before they disappear.",
    steps: [
      "Press Start to begin the 30-second round.",
      "Watch the 3×3 grid — moles pop up at random holes.",
      "Tap a mole the instant it appears to score a point.",
      "When time runs out, your total and best score are shown.",
    ],
    tips: [
      "Keep your finger ready over the grid — speed beats aiming.",
      "Moles stay up only briefly, so react fast.",
      "Your best score is saved locally on your device.",
    ],
  },
  "ball-launcher": {
    intro: "Aim the cannon with your finger and fire balls to pop floating bubbles.",
    steps: [
      "Press Start to begin the 30-second round.",
      "Touch and drag on the play field to aim the cannon.",
      "Release to launch a ball in a gravity arc toward the bubbles.",
      "Pop a bubble for 10 points — new bubbles keep appearing.",
      "When time runs out, your total and best score are shown.",
    ],
    tips: [
      "Aim slightly above a bubble so gravity drops the ball onto it.",
      "Bubbles drift sideways — lead them like a moving target.",
      "Balls bounce off the walls, so bank shots can reach tricky spots.",
    ],
  },
};