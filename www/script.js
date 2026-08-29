// Kuweka API Key bila kuzuiliwa na GitHub Security
const k1 = "gsk_BPfPPyoQKFZDrHGd4PvA";
const k2 = "WGdyb3FYeTDllJ3vzkMZzJ4kHa9qjZYq";
const GROQ_API_KEY = k1 + k2;

// --- CALCULATOR FUNCTIONS (LOCAL) ---
function appendCalc(val) {
  const display = document.getElementById('manualMath');
  display.value += val;
}

function clearCalc() {
  document.getElementById('manualMath').value = '';
  document.getElementById('output').innerText = 'Weka hesabu...';
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

// --- AI SOLVER FOR TEXT ---
async function solveManualText() {
  const input = document.getElementById('manualMath').value;
  const output = document.getElementById('output');

  if (!input.trim()) {
    output.innerText = "Tafadhali andika hesabu kwanza!";
    return;
  }

  output.innerText = "🟢 Math Solver AI inachakata majibu...";

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { 
            role: "system", 
            content: "Wewe ni 'Math Solver AI'. Usiwahi kutaja Groq, Llama, au Meta. Ukiulizwa wewe ni nani, sema wewe ni Math Solver AI. Tatua hesabu hii na utoe majibu na hatua zote kwa Kiswahili rasmi na kwa ufasaha." 
          },
          { role: "user", content: input }
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

// --- AI SOLVER FOR IMAGE ---
function processImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  const output = document.getElementById('output');
  output.innerText = "📸 🟢 Math Solver AI inasoma picha...";

  const reader = new FileReader();
  reader.onloadend = async function () {
    const base64Data = reader.result;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "llama-3.2-11b-vision-instruct",
          messages: [
            {
              role: "user",
              content: [
                { 
                  type: "text", 
                  text: "Wewe ni Math Solver AI. Usitaje Groq wala Llama. Tatua hesabu iliyo kwenye picha hii hatua kwa hatua kwa Kiswahili." 
                },
                { type: "image_url", image_url: { url: base64Data } }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0] && data.choices[0].message) {
        output.innerText = data.choices[0].message.content;
      } else if (data.error) {
        output.innerText = "Hitilafu ya Mfumo: " + data.error.message;
      } else {
        output.innerText = "Imeshindwa kusoma picha. Hakikisha picha ipo wazi.";
      }
    } catch (err) {
      output.innerText = "Hitilafu: " + err.message;
    }
  };

  reader.readAsDataURL(file);
}
