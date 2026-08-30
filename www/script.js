// GitHub Secrets itaingiza API key yako halisi hapa kiotomatiki
const GROQ_API_KEY = "__GROQ_API_KEY__";

// Function ya kuvuta Model iliyo hai (Active) moja kwa moja kutoka Groq API
async function getActiveTextModel() {
  try {
    const res = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { "Authorization": `Bearer ${GROQ_API_KEY}` }
    });
    const data = await res.json();
    if (data.data && data.data.length > 0) {
      // Chuja model za sauti (whisper) na uchukue ya kwanza ya maandishi
      const textModels = data.data.filter(m => !m.id.includes("whisper"));
      return textModels[0].id;
    }
  } catch (err) {
    console.error("Imeshindwa kupata orodha ya models:", err);
  }
  // Model ya akiba kama server haijajibu orodha
  return "llama-3.3-70b-versatile";
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

// --- CORE AI SOLVER WITH DYNAMIC MODEL SELECTION ---
async function sendToAI(mathText) {
  const output = document.getElementById('output');
  output.innerText = "🟢 WILLY CALCULATOR inafuta model hai na kuchakata majibu...";

  try {
    // Pata model iliyopo hewani hivi sasa
    const activeModel = await getActiveTextModel();

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: activeModel,
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

// --- AI SOLVER FOR TEXT BUTTON ---
function solveManualText() {
  const input = document.getElementById('manualMath').value;
  if (!input.trim()) {
    document.getElementById('output').innerText = "Tafadhali andika hesabu kwanza!";
    return;
  }
  sendToAI(input);
}

// --- VISION AI SCANNER FOR IMAGES ---
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
          model: "llama-3.2-11b-vision-preview",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Soma hesabu iliyopo kwenye picha hii (iwe ya mkono au iliyochapishwa), kisha uitatue na utoe majibu pamoja na hatua zote kwa Kiswahili rasmi."
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
        output.innerText = "Imeshindwa kusoma picha.";
      }
    } catch (err) {
      output.innerText = "Hitilafu ya Mtandao: " + err.message;
    }
  };

  reader.readAsDataURL(file);
}
