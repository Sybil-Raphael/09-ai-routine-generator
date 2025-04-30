
// Load saved preferences
document.addEventListener('DOMContentLoaded', () => {
  const savedPreferences = JSON.parse(localStorage.getItem('routinePreferences') || '{}');
  
  if (savedPreferences.timeOfDay) {
    document.getElementById('timeOfDay').value = savedPreferences.timeOfDay;
    document.getElementById('focusArea').value = savedPreferences.focusArea;
    document.getElementById('timeAvailable').value = savedPreferences.timeAvailable;
    document.getElementById('energyLevel').value = savedPreferences.energyLevel;
    
    if (savedPreferences.activities) {
      const checkboxes = document.getElementsByName('activities');
      checkboxes.forEach(checkbox => {
        checkbox.checked = savedPreferences.activities.includes(checkbox.value);
      });
    }
  }
});

// Handle form submission
document.getElementById('routineForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Get form values
  const timeOfDay = document.getElementById('timeOfDay').value;
  const focusArea = document.getElementById('focusArea').value;
  const timeAvailable = document.getElementById('timeAvailable').value;
  const energyLevel = document.getElementById('energyLevel').value;
  
  const activities = Array.from(document.getElementsByName('activities'))
    .filter(checkbox => checkbox.checked)
    .map(checkbox => checkbox.value);
  
  // Save preferences
  const preferences = {
    timeOfDay,
    focusArea,
    timeAvailable,
    energyLevel,
    activities
  };
  localStorage.setItem('routinePreferences', JSON.stringify(preferences));
  
  // Show loading state
  const button = e.target.querySelector('button');
  const originalText = button.textContent;
  button.textContent = 'Generating...';
  button.disabled = true;
  
  try {
    // Prepare the prompt for GPT
    const prompt = `Create a personalized daily routine with these preferences:
    - Time of day: ${timeOfDay}
    - Focus area: ${focusArea}
    - Time available: ${timeAvailable} minutes
    - Energy level: ${energyLevel}
    - Preferred activities: ${activities.join(', ')}
    
    Please provide a structured, step-by-step routine that fits these parameters.`;
    
    // Make API call to OpenAI (implementation will need API key)
    const response = await fetch('YOUR_API_ENDPOINT', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.7
      })
    });
    
    const data = await response.json();
    const routine = data.choices[0].message.content;
    
    // Display result
    document.getElementById('result').classList.remove('hidden');
    document.getElementById('routineOutput').textContent = routine;
    
  } catch (error) {
    console.error('Error:', error);
    document.getElementById('routineOutput').textContent = 'Sorry, there was an error generating your routine. Please try again.';
  } finally {
    // Reset button state
    button.textContent = originalText;
    button.disabled = false;
  }
});
