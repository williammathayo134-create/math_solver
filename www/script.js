const GROQ_API_KEY = "__GROQ_API_KEY__";
const CURRENT_VERSION = "1.0.0";
const VERSION_CHECK_URL = "https://raw.githubusercontent.com/williammathayo134-create/math_solver/main/www/version.json";

// Model rasmi zilizopo kwenye Groq Production Docs
const OFFICIAL_MODEL = "llama-3.3-70b-versatile";

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
    }
  } catch (err) {
    console.log("Haikufanikiwa kuangalia update:", err);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  checkForAppUpdates();
});

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

// --- CORE AI SOLVER FOR TEXT ---
async function sendToAI(mathText) {
  const output = document.getElementById('output');
  output.innerText = "🟢 WILLY CALCULATOR inachakata majibu...";

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: OFFICIAL_MODEL,
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
    } else if (data.error) {
      output.innerText = "⚠️ Hitilafu: " + data.error.message;
    } else {
      output.innerText = "⚠️ Mfumo umeshindwa kupata jibu, jaribu tena.";
    }
  } catch (err) {
    output.innerText = "⚠️ Hitilafu ya Mtandao: " + err.message;
  }
}

function solveManualText() {
  const input = document.getElementById('manualMath').value;
  if (!input.trim()) {
    document.getElementById('output').innerText = "Tafadhali andika hesabu kwanza!";
    return;
  }
  sendToAI(input);
}

// --- IMAGE MATH SCANNER (FREE OCR + LLAMA 3.3 70B) ---
async function processImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  const output = document.getElementById('output');
  output.innerText = "🔍 Inasoma maandishi kwenye picha...";

  const formData = new FormData();
  formData.append("file", file);
  formData.append("apikey", "helloworld"); // Free OCR API key
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
      
      // Tuma hesabu iliyosomwa kwa Llama-3.3-70b-versatile
      sendToAI(extractedText);
    } else {
      output.innerText = "⚠️ Haikuweza kusoma picha hiyo. Jaribu kupiga picha iliyonyooka.";
    }
  } catch (err) {
    output.innerText = "⚠️ Hitilafu ya Kusoma Picha: " + err.message;
  }
}
