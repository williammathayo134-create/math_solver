// Obfuscated API Key
const k1 = "gsk_BPfPPyoQKFZDrHGd4PvA";
const k2 = "WGdyb3FYeTDllJ3vzkMZzJ4kHa9qjZYq";
const GROQ_API_KEY = k1 + k2;

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

// --- CORE AI SOLVER FUNCTION ---
async function sendToAI(mathText) {
  const output = document.getElementById('output');
  output.innerText = "🟢 Math Solver AI inachakata majibu...";

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-r1-distill-llama-70b",
        messages: [
          { 
            role: "system", 
            content: "Wewe ni 'WILLY CALCULATOR AI'. Usiwahi kutaja Groq, Llama, au Meta. Tatua hesabu hii na utoe majibu na hatua zote kwa Kiswahili rasmi na kwa ufasaha." 
          },
          { 
            role: "user", 
            content: mathText 
          }
        ],
        temperature: 0.2
      })
    });

    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      output.innerText = data.choices[0].message.content;
    } else if (data.error) {
      output.innerText = "Hitilafu ya Mfumo: " + data.error.message;
    } else {
      output.innerText = "Imeshindwa kupata jibu, jaribu tena.";
    }
  } catch (err) {
    output.innerText = "Hitilafu ya Mtandao: " + err.message;
  }
}

// --- AI SOLVER FOR TEXT ---
function solveManualText() {
  const input = document.getElementById('manualMath').value;
  if (!input.trim()) {
    document.getElementById('output').innerText = "Tafadhali andika hesabu kwanza!";
    return;
  }
  sendToAI(input);
}

// --- AI SOLVER FOR IMAGE (OCR) ---
async function processImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  const output = document.getElementById('output');
  output.innerText = "🔍 Inasoma hesabu kwenye picha...";

  try {
    const result = await Tesseract.recognize(file, 'eng');
    const mathText = result.data.text.trim();

    if (!mathText) {
      output.innerText = "⚠️ Imeshindwa kusoma hesabu kwenye picha. Jaribu kupiga picha iliyonyooka.";
      return;
    }

    document.getElementById('manualMath').value = mathText;
    await sendToAI(mathText);

  } catch (err) {
    output.innerText = "Hitilafu ya OCR: " + err.message;
  }
}
