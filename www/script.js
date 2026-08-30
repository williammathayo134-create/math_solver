const GROQ_API_KEY = "__GROQ_API_KEY__";
const CURRENT_VERSION = "1.0.0";
const VERSION_CHECK_URL = "https://raw.githubusercontent.com/williammathayo134-create/math_solver/main/www/version.json";

// --- AUTO UPDATE CHECKER ---
async function checkForAppUpdates() {
  try {
    const response = await fetch(VERSION_CHECK_URL + "?t=" + Date.now());
    const data = await response.json();

    if (data.version && data.version !== CURRENT_VERSION) {
      const output = document.getElementById('output');
      output.innerHTML = `
        <div style="background: #1b5e20; padding: 10px; border-radius: 5px; color: #fff; margin-bottom: 10px;">
          🚀 <b>Toleo Jipya (${data.version}) Linapatikana!</b><br>
          <button onclick="window.open('${data.download_url}', '_system')" style="margin-top: 8px; padding: 8px; background: #4CAF50; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
            Pakua Update Mpya
          </button>
        </div>
      ` + output.innerHTML;
      openDrawer();
    }
  } catch (err) {
    console.log("Haikufanikiwa kuangalia update:", err);
  }
}

// --- DRAWER TOGGLE & SWIPE LOGIC ---
function toggleDrawer() {
  const drawer = document.getElementById('onlineDrawer');
  drawer.classList.toggle('open');
}

function openDrawer() {
  const drawer = document.getElementById('onlineDrawer');
  if (drawer && !drawer.classList.contains('open')) {
    drawer.classList.add('open');
  }
}

let touchStartY = 0;
let touchEndY = 0;

window.addEventListener('DOMContentLoaded', () => {
  checkForAppUpdates();

  const drawer = document.getElementById('onlineDrawer');
  if (drawer) {
    drawer.addEventListener('touchstart', (e) => {
      touchStartY = e.changedTouches[0].screenY;
    }, false);

    drawer.addEventListener('touchend', (e) => {
      touchEndY = e.changedTouches[0].screenY;
      handleSwipe();
    }, false);
  }
});

function handleSwipe() {
  const drawer = document.getElementById('onlineDrawer');
  if (!drawer) return;
  if (touchStartY - touchEndY > 40) {
    drawer.classList.add('open');
  }
  if (touchEndY - touchStartY > 40) {
    drawer.classList.remove('open');
  }
}

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

// --- SMART AUTO-TRY AI SOLVER (LOOPS THROUGH ALL YOUR AVAILABLE MODELS) ---
async function sendToAI(mathText) {
  openDrawer();
  const output = document.getElementById('output');
  output.innerText = "🟢 WILLY CALCULATOR inafanya jaribio la kubaini model inayokubali...";

  try {
    const modelsRes = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { "Authorization": `Bearer ${GROQ_API_KEY}` }
    });
    const modelsData = await modelsRes.json();

    if (!modelsData.data || modelsData.data.length === 0) {
      output.innerText = "⚠️ Imeshindwa kupata orodha ya models. Angalia API key yako.";
      return;
    }

    const usableModels = modelsData.data
      .map(m => m.id)
      .filter(id => 
        !id.includes("whisper") && 
        !id.includes("guard") && 
        !id.includes("canopylabs") &&
        !id.includes("orpheus")
      );

    let success = false;
    let lastError = "";

    for (const modelId of usableModels) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GROQ_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: modelId,
            messages: [
              { 
                role: "system", 
                content: "Wewe ni 'WILLY CALCULATOR AI'. Usiwahi kutaja Groq au Meta. Tatua hesabu hii na utoe majibu na hatua zote kwa Kiswahili rasmi na kwa ufasaha." 
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
      } catch (e) {
        lastError = e.message;
      }
    }

    if (!success) {
      output.innerText = "⚠️ Model zote zimefeli. Hitilafu ya mwisho: " + lastError;
    }

  } catch (err) {
    output.innerText = "⚠️ Hitilafu ya Mtandao: " + err.message;
  }
}

function solveManualText() {
  const input = document.getElementById('manualMath').value;
  if (!input.trim()) {
    openDrawer();
    document.getElementById('output').innerText = "Tafadhali andika hesabu kwanza!";
    return;
  }
  sendToAI(input);
}

// --- IMAGE MATH SCANNER (FREE OCR + SMART AI SOLVER) ---
async function processImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  openDrawer();
  const output = document.getElementById('output');
  output.innerText = "🔍 Inasoma maandishi kwenye picha...";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("apikey", "helloworld");
  formData.append("language", "eng");

  try {
    const ocrResponse = await fetch("https://api.ocr.space/parse/image", {
      method: "POST",
      body: formData
    });
    
    const ocrData = await ocrResponse.json();

    if (ocrData.ParsedResults && ocrData.ParsedResults.length > 0) {
      const extractedText = ocrData.ParsedResults[0].ParsedText.trim();
      
      if (!extractedText) {
        output.innerText = "⚠️ Haikuweza kusoma maandishi kwenye picha. Hakikisha picha inaonekana vizuri.";
        return;
      }

      document.getElementById('manualMath').value = extractedText;
      output.innerText = "📝 Hesabu iliyosomwa: " + extractedText + "\n\n🟢 Inatuma kwa AI kupata majibu...";
      
      sendToAI(extractedText);
    } else {
      output.innerText = "⚠️ Haikuweza kusoma picha hiyo. Jaribu kupiga picha iliyonyooka.";
    }
  } catch (err) {
    output.innerText = "⚠️ Hitilafu ya Kusoma Picha: " + err.message;
  }
}

