// Function to save preferences to localStorage
function savePreferences() {
  const preferences = {
    timeOfDay: document.getElementById('timeOfDay').value,
    focusArea: document.getElementById('focusArea').value,
    timeAvailable: document.getElementById('timeAvailable').value,
    energyLevel: document.getElementById('energyLevel').value,
    activities: Array.from(document.querySelectorAll('input[name="activities"]:checked')).map(input => input.value)
  };
  localStorage.setItem('routinePreferences', JSON.stringify(preferences));
}

// Function to load preferences from localStorage and apply them to the form
function loadPreferences() {
  const saved = localStorage.getItem('routinePreferences');
  if (saved) {
    const preferences = JSON.parse(saved);
    document.getElementById('timeOfDay').value = preferences.timeOfDay;
    document.getElementById('focusArea').value = preferences.focusArea;
    document.getElementById('timeAvailable').value = preferences.timeAvailable;
    document.getElementById('energyLevel').value = preferences.energyLevel;
    // Uncheck all activities first
    document.querySelectorAll('input[name="activities"]').forEach(input => {
      input.checked = preferences.activities.includes(input.value);
    });
  }
}

// Load preferences when the page loads
window.addEventListener('DOMContentLoaded', loadPreferences);

// Add an event listener to the form that runs when the form is submitted
document.getElementById('routineForm').addEventListener('submit', async (e) => {
  // Prevent the form from refreshing the page
  e.preventDefault();

  // Save preferences to localStorage
  savePreferences();

  // Get values from all inputs and store them in variables
  // Get the selected time of day
  const timeOfDay = document.getElementById('timeOfDay').value;
  // Get the selected focus area
  const focusArea = document.getElementById('focusArea').value;
  // Get the selected time available
  const timeAvailable = document.getElementById('timeAvailable').value;
  // Get the selected energy level
  const energyLevel = document.getElementById('energyLevel').value;
  // Get all checked preferred activities
  const activityInputs = document.querySelectorAll('input[name="activities"]:checked');
  const preferredActivities = Array.from(activityInputs).map(input => input.value);

  // Find the submit button and update its appearance to show loading state
  const button = document.querySelector('button[type="submit"]');
  button.textContent = 'Generating...';
  button.disabled = true;

  try {
    // Build the user prompt using template literals
    const userPrompt = `Plan a personalized daily routine for me based on these preferences:
- Time of day: ${timeOfDay}
- Focus area: ${focusArea}
- Time available: ${timeAvailable} minutes
- Energy level: ${energyLevel}
- Preferred activities: ${preferredActivities.length > 0 ? preferredActivities.join(', ') : 'None'}

Please provide a structured, step-by-step routine that fits these parameters.`;

    // Make the API call to OpenAI's chat completions endpoint
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: `You are a helpful assistant that creates quick, focused daily routines. Always keep routines short, realistic, and tailored to the user's preferences.` },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_completion_tokens: 500
      })
    });

    // Convert API response to JSON and get the generated routine
    const data = await response.json();
    const routine = data.choices[0].message.content;

    // Show the result section and display the routine
    document.getElementById('result').classList.remove('hidden');
    document.getElementById('routineOutput').textContent = routine;

  } catch (error) {
    // If anything goes wrong, log the error and show user-friendly message
    console.error('Error:', error);
    document.getElementById('routineOutput').textContent = 'Sorry, there was an error generating your routine. Please try again.';
  } finally {
    // Always reset the button back to its original state using innerHTML to render the icon
    button.innerHTML = '<i class="fas fa-wand-magic-sparkles"></i> Generate My Routine';
    button.disabled = false;
  }
});
