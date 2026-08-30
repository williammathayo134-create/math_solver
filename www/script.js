// GitHub Secrets itaingiza API key yako halisi hapa kiotomatiki wakati wa kujenga APK
const GROQ_API_KEY = "__GROQ_API_KEY__";

// Orodha ya Text Models za Akiba
const TEXT_MODELS = [
  "llama-3.3-70b-versatile",
  "llama-3.1-8b-instant"
];

// Model ya Vision AI ya ku-scan picha moja kwa moja
const VISION_MODEL = "llama-3.2-11b-vision-preview";

// --- CALCULATOR FUNCTIONS (LOCAL / OFFLINE) ---
function appendCalc(val) {
  const display = document.getElementById('manualMath');
  display.value += val;
}

function clearCalc() {
  document.getElementById('manualMath').value = '';
  document.getElementById('output').innerText = 'Ingiza hesabu au piga picha kupata hatua...';
}

function calculateLocal() {
  const display = document.getElementById('manualMath');
  const output = document.getElementById('output');
  
  if (!display.value.trim()) return;

  try {
    let expression = display.value;
    let result = eval(expression);
    display.value = result;
    output.innerText = "Jibu la Haraka: " + result;
  } catch (err) {
    output.innerText = "Hitilafu: Angalia kama umeandika namba vizuri.";
  }
}

// --- AI SOLVER FOR TEXT WITH AUTOMATIC FALLBACK ---
async function sendToAI(mathText) {
  const output = document.getElementById('output');
  output.innerText = "🟢 WILLY CALCULATOR inachakata majibu...";

  let success = false;
  let lastError = "";

  for (let i = 0; i < TEXT_MODELS.length; i++) {
    const currentModel = TEXT_MODELS[i];
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: currentModel,
          messages: [
            { 
              role: "system", 
              content: "Wewe ni 'WILLY CALCULATOR AI'. Usiwahi kutaja Groq, Llama, au Meta. Tatua hesabu hii na utoe majibu na hatua zote kwa Kiswahili rasmi na kwa ufasaha." 
            },
            { role: "user", content: mathText }
          ],
          temperature: 0.2
        })
      });

      const data = await response.json();

      if (data.choices && data.choices[0] && data.choices[0].message) {
        output.innerText = data.choices[0].message.content;
        success = true;
        break;
      } else if (data.error) {
        lastError = data.error.message;
      }
    } catch (err) {
      lastError = err.message;
    }
  }

  if (!success) {
    output.innerText = "⚠️ Imeshindwa kupata jibu kutoka kwenye Server.\nHitilafu: " + lastError;
  }
}

// --- AI SOLVER FOR TEXT BUTTON ---
function solveManualText() {
  const input = document.getElementById('manualMath').value;
  if (!input.trim()) {
    document.getElementById('output').innerText = "Tafadhali andika hesabu kwanza!";
    return;
  }
  sendToAI(input);
}

// --- VISION AI SCANNER (DIRECT IMAGE MATH SOLVER) ---
async function processImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  const output = document.getElementById('output');
  output.innerText = "🔍 Vision AI inasoma na kutatua hesabu kwenye picha...";

  const reader = new FileReader();
  reader.onloadend = async function () {
    const base64Image = reader.result;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: VISION_MODEL,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Soma hesabu iliyopo kwenye picha hii (iwe ya mkono au iliyochapishwa), kisha uitatue na utoe majibu pamoja na hatua zote kwa Kiswahili rasmi na ufasaha."
                },
                {
                  type: "image_url",
                  image_url: {
                    url: base64Image
                  }
                }
              ]
            }
          ],
          temperature: 0.2
        })
      });

      const data = await response.json();

      if (data.choices && data.choices[0] && data.choices[0].message) {
        output.innerText = data.choices[0].message.content;
      } else if (data.error) {
        output.innerText = "Hitilafu ya Vision AI: " + data.error.message;
      } else {
        output.innerText = "Imeshindwa kusoma picha, jaribu kupiga picha iliyonyooka.";
      }
    } catch (err) {
      output.innerText = "Hitilafu ya Mtandao wakati wa ku-scan: " + err.message;
    }
  };

  reader.readAsDataURL(file);
}
