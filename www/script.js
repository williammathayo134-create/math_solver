const GROQ_API_KEY = "Gsk_BPfPPyoQKFZDrHGd4PvAWGdyb3FYeTDllJ3vzkMZzJ4kHa9qjZYq";

// Handle Text Queries
async function solveManualText() {
  const input = document.getElementById('manualMath').value;
  const output = document.getElementById('output');

  if (!input.trim()) {
    output.innerText = "Tafadhali andika hesabu kwanza!";
    return;
  }

  output.innerText = "⏳ Inachakata na Groq AI...";

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: "Wewe ni mwalimu wa hisabati. Toa majibu na hatua kwa Swahili." },
          { role: "user", content: input }
        ]
      })
    });

    const data = await response.json();
    if (data.choices && data.choices[0]) {
      output.innerText = data.choices[0].message.content;
    } else {
      output.innerText = "Kukosekana kwa jibu, jaribu tena.";
    }
  } catch (err) {
    output.innerText = "Hitilafu kwenye mtandao au API Key: " + err.message;
  }
}

// Handle Image Processing
function processImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  const output = document.getElementById('output');
  output.innerText = "📸 Inasoma picha na kutuma kwa AI...";

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
                { type: "text", text: "Tafadhali tatua hesabu iliyo kwenye picha hii hatua kwa hatua kwa Kiswahili." },
                { type: "image_url", image_url: { url: base64Image } }
              ]
            }
          ]
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0]) {
        output.innerText = data.choices[0].message.content;
      } else {
        output.innerText = "Imeshindwa kusoma picha. Hakikisha picha ipo wazi.";
      }
    } catch (err) {
      output.innerText = "Hitilafu: " + err.message;
    }
  };

  reader.readAsDataURL(file);
}
