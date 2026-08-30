const GROQ_API_KEY = "__GROQ_API_KEY__";
const CURRENT_VERSION = "1.0.0";
const VERSION_CHECK_URL = "https://raw.githubusercontent.com/williammathayo134-create/math_solver/main/www/version.json";

let lastAnswer = 0;

// --- CALCULATOR ENGINE FUNCTIONS ---
function appendCalc(val) {
  const display = document.getElementById('manualMath');
  if (display.value === "0") display.value = "";
  if (val === 'Ans') {
    display.value += lastAnswer;
  } else {
    display.value += val;
  }
}

function clearCalc() {
  document.getElementById('manualMath').value = '0';
  document.getElementById('lcdResult').innerText = '0';
}

function deleteLast() {
  const display = document.getElementById('manualMath');
  display.value = display.value.slice(0, -1);
  if (display.value === "") display.value = "0";
}

function calculateLocal() {
  const display = document.getElementById('manualMath');
  const resultElem = document.getElementById('lcdResult');
  
  if (!display.value.trim()) return;

  try {
    let expr = display.value
      .replace(/\^2/g, '**2')
      .replace(/\^/g, '**')
      .replace(/°/g, '* Math.PI / 180');
      
    let res = eval(expr);
    lastAnswer = res;
    resultElem.innerText = res;
  } catch (err) {
    resultElem.innerText = "Syntax ERROR";
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

// --- AUTO UPDATE CHECKER ---
async function checkForAppUpdates() {
  try {
    const response = await fetch(VERSION_CHECK_URL + "?t=" + Date.now());
    const data = await response.json();

    if (data.version && data.version !== CURRENT_VERSION) {
      openDrawer();
      const output = document.getElementById('output');
      output.innerHTML = `
        <div style="background: #1b5e20; padding: 8px; border-radius: 5px; color: #fff; margin-bottom: 8px;">
          🚀 <b>Toleo Jipya (${data.version}) Linapatikana!</b><br>
          <button onclick="window.open('${data.download_url}', '_system')" style="margin-top: 5px; padding: 6px; background: #4CAF50; color: white; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">
            Pakua Update Mpya
          </button>
        </div>
      ` + output.innerHTML;
    }
  } catch (err) {
    console.log("Haikufanikiwa kuangalia update:", err);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  checkForAppUpdates();
});

// --- SMART AI SOLVER FOR DETAILED STEPS ---
async function sendToAI(mathText) {
  openDrawer();
  const output = document.getElementById('output');
  output.innerText = "🟢 CASIO AI inachakata majibu na hatua...";

  try {
    const modelsRes = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { "Authorization": `Bearer ${GROQ_API_KEY}` }
    });
    const modelsData = await modelsRes.json();

    if (!modelsData.data || modelsData.data.length === 0) {
      output.innerText = "⚠️ Imeshindwa kuunganisha na server. Angalia internet/API Key.";
      return;
    }

    const usableModels = modelsData.data
      .map(m => m.id)
      .filter(id => !id.includes("whisper") && !id.includes("guard") && !id.includes("canopylabs"));

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
                content: "Wewe ni 'CASIO fx-570ES PLUS AI SOLVER'. Usitaje Groq/Meta. Tatua hesabu hii na utoe hatua zote kwa Kiswahili rasmi na ufasaha." 
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
      output.innerText = "⚠️ Hitilafu ya AI: " + lastError;
    }

  } catch (err) {
    output.innerText = "⚠️ Hitilafu ya Mtandao: " + err.message;
  }
}

function solveManualText() {
  const input = document.getElementById('manualMath').value;
  if (!input.trim() || input === "0") {
    openDrawer();
    document.getElementById('output').innerText = "Tafadhali andika hesabu kwanza!";
    return;
  }
  sendToAI(input);
}

// --- IMAGE OCR SCANNER ---
async function processImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  openDrawer();
  const output = document.getElementById('output');
  output.innerText = "🔍 Inasoma picha ya hesabu...";

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
        output.innerText = "⚠️ Haikuweza kusoma picha. Hakikisha picha inaonekana vizuri.";
        return;
      }

      document.getElementById('manualMath').value = extractedText;
      output.innerText = "📝 Hesabu iliyosomwa: " + extractedText + "\n\n🟢 Inatuma kwa AI kupata hatua...";
      sendToAI(extractedText);
    } else {
      output.innerText = "⚠️ Imeshindwa kusoma picha.";
    }
  } catch (err) {
    output.innerText = "⚠️ Hitilafu ya OCR: " + err.message;
  }
}
