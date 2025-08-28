const chatBody = document.querySelector(".chat-body");
const messageInput = document.querySelector(".message-input");
const sendMessage = document.querySelector("#send-message");
const fileInput = document.querySelector("#file-input");
const fileUploadWrapper = document.querySelector(".file-upload-wrapper");
const fileCancelButton = fileUploadWrapper.querySelector("#file-cancel");
const chatbotToggler = document.querySelector("#chatbot-toggler");
const closeChatbot = document.querySelector("#close-chatbot");
const advancedModeButton = document.querySelector("#advanced-mode");
// API setup
const API_KEY = "AIzaSyC3IkDvwqAtlLO5cdrRx9ZEr0z0X_gWH3k";
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;
// Initialize user message and file data
const userData = {
  message: null,
  file: {
    data: null,
    mime_type: null,
  },
};
// Store chat history
const chatHistory = [];
const initialInputHeight = messageInput.scrollHeight;
// CSV data storage
let csvData = [];
let isAdvancedMode = false;
// Load CSV data
const loadCSVData = async () => {
  try {
    console.log('Starting to load CSV data...');
    const response = await fetch('interview_qa.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const csvText = await response.text();
    console.log('Raw CSV text:', csvText);
    
    const rows = csvText.split('\n').filter(row => row.trim() !== '');
    console.log('Number of rows after filtering:', rows.length);
    
    csvData = rows.map(row => {
      // Handle both formats
      let question, answer;
      
      if (row.includes('Question Number')) {
        // Skip header row for software development questions
        return null;
      }
      
      if (row.includes('#')) {
        // Skip section headers
        return null;
      }
      
      const parts = row.split(',').map(item => item.trim());
      
      if (parts.length === 2) {
        // Original format: question,answer
        [question, answer] = parts;
      } else if (parts.length >= 3) {
        // Software development format: Question Number,Question,Answer,Category,Difficulty
        question = parts[1];
        answer = parts[2];
      } else {
        console.warn('Skipping invalid row:', row);
        return null;
      }
      
      if (!question || !answer) {
        console.warn('Skipping row with missing data:', row);
        return null;
      }
      
      console.log('Processing row:', { question, answer });
      return { question: question.toLowerCase(), answer };
    }).filter(item => item !== null);
    
    console.log('Final CSV data loaded:', csvData);
    
    if (csvData.length === 0) {
      throw new Error('No valid questions found in CSV');
    }
    
    // Show success message in chat
    const messageContent = `<div class="message-text">Interview data loaded successfully! (${csvData.length} questions available)</div>`;
    const botMessageDiv = createMessageElement(messageContent, "bot-message");
    chatBody.appendChild(botMessageDiv);
    
  } catch (error) {
    console.error('Error loading CSV:', error);
    // Show error in chat
    const messageContent = `<div class="message-text">Error loading interview data: ${error.message}. Please make sure you're accessing the page through http://localhost/geminitest/</div>`;
    const botMessageDiv = createMessageElement(messageContent, "bot-message");
    chatBody.appendChild(botMessageDiv);
  }
};
// Load CSV data when page loads
loadCSVData();
// Toggle advanced mode
advancedModeButton.addEventListener('click', () => {
  isAdvancedMode = !isAdvancedMode;
  advancedModeButton.classList.toggle('active');
  const messageContent = `<div class="message-text">Switched to ${isAdvancedMode ? 'Advanced API' : 'CSV'} mode</div>`;
  const botMessageDiv = createMessageElement(messageContent, "bot-message");
  chatBody.appendChild(botMessageDiv);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
});
// Create message element with dynamic classes and return it
const createMessageElement = (content, ...classes) => {
  const div = document.createElement("div");
  div.classList.add("message", ...classes);
  div.innerHTML = content;
  return div;
};
// Check if message is job interview related
const isJobInterviewRelated = (message) => {
  const interviewKeywords = [
    'interview', 'job', 'career', 'resume', 'cv', 'application',
    'position', 'role', 'hiring', 'recruitment', 'candidate',
    'employer', 'employee', 'work', 'professional', 'experience',
    'skills', 'qualification', 'salary', 'compensation', 'benefits',
    'company', 'organization', 'industry', 'workplace', 'office',
    'preparation', 'prep', 'practice', 'mock', 'behavioral',
    'technical', 'assessment', 'screening', 'recruiter', 'hiring manager',
    'job search', 'career development', 'professional growth',
    'work experience', 'job application', 'job offer', 'job market'
  ];
  
  const messageLower = message.toLowerCase();
  return interviewKeywords.some(keyword => messageLower.includes(keyword));
};
// Find best matching question from CSV
const findBestMatch = (userQuestion) => {
  if (!csvData || csvData.length === 0) {
    console.error('CSV data is not loaded or empty');
    return null;
  }

  const userQuestionLower = userQuestion.toLowerCase().trim();
  let bestMatch = null;
  let highestScore = 0;

  console.log('Current CSV data:', csvData);
  console.log('Searching for match for:', userQuestionLower);

  // First try exact match
  const exactMatch = csvData.find(item => item.question.toLowerCase() === userQuestionLower);
  if (exactMatch) {
    console.log('Found exact match:', exactMatch);
    return exactMatch;
  }

  // If no exact match, try partial match
  csvData.forEach(item => {
    const questionWords = item.question.toLowerCase().split(' ');
    const userWords = userQuestionLower.split(' ');
    
    // Calculate score based on word matches and word order
    let score = 0;
    userWords.forEach((word, index) => {
      if (questionWords.includes(word)) {
        score += 2; // Exact word match
      } else {
        // Check for partial matches
        questionWords.forEach(qWord => {
          if (qWord.includes(word) || word.includes(qWord)) {
            score += 1; // Partial word match
          }
        });
      }
    });

    // Bonus points for matching first words
    if (userWords[0] === questionWords[0]) {
      score += 3;
    }

    console.log('Comparing with:', item.question, 'Score:', score);
    
    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
    }
  });

  console.log('Best match:', bestMatch, 'Score:', highestScore);
  return highestScore >= 2 ? bestMatch : null;
};
// Generate bot response using API or CSV
const generateBotResponse = async (incomingMessageDiv) => {
  const messageElement = incomingMessageDiv.querySelector(".message-text");
  
  if (isAdvancedMode) {
    // API mode - Only for job interview related questions
    if (!isJobInterviewRelated(userData.message) && !userData.file.data) {
      messageElement.innerText = "I can only help with job interview related questions. Please ask about interviews, careers, or job-related topics.";
      userData.file = {};
      incomingMessageDiv.classList.remove("thinking");
      chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
      return;
    }

    // Prepare the request payload
    const requestPayload = {
      contents: [{
        role: "user",
        parts: []
      }]
    };

    // Add text message if present
    if (userData.message) {
      requestPayload.contents[0].parts.push({ text: userData.message });
    }

    // Add image if present
    if (userData.file.data) {
      const base64Image = userData.file.data.split(',')[1];
      requestPayload.contents[0].parts.push({
        inline_data: {
          mime_type: userData.file.mime_type,
          data: base64Image
        }
      });
    }

    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestPayload)
    };

    try {
      const response = await fetch(API_URL, requestOptions);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to get response from API');
      }
      
      const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
      messageElement.innerText = apiResponseText;
      
      chatHistory.push({
        role: "model",
        parts: [{ text: apiResponseText }]
      });
    } catch (error) {
      console.error('API Error:', error);
      messageElement.innerText = "Sorry, I encountered an error processing your request. Please try again.";
      messageElement.style.color = "#ff0000";
    }
  } else {
    // CSV mode - Open to any questions
    console.log('CSV Mode - Current data:', csvData);
    const match = findBestMatch(userData.message);
    console.log('Found match:', match);
    
    if (match) {
      messageElement.innerText = match.answer;
    } else {
      messageElement.innerText = "I'm sorry, I couldn't find a relevant answer in my database. Try switching to Advanced mode for more comprehensive responses.";
    }
  }

  userData.file = {};
  incomingMessageDiv.classList.remove("thinking");
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
};
// Handle outgoing message
const handleOutgoingMessage = (e) => {
  e.preventDefault();
  const message = messageInput.value.trim();
  
  // Only proceed if there's either a message or a file
  if (!message && !userData.file.data) return;

  const messageContent = `
    <div class="message-text">
      ${message}
      ${userData.file.data ? `<img src="${userData.file.data}" alt="Uploaded image" style="max-width: 200px; margin-top: 10px;">` : ''}
    </div>
  `;
  const outgoingMessageDiv = createMessageElement(messageContent, "user-message");
  chatBody.appendChild(outgoingMessageDiv);
  chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

  // Clear input and file data
  messageInput.value = "";
  messageInput.style.height = `${initialInputHeight}px`;
  userData.message = message;
  
  // Generate bot response
  const incomingMessageDiv = createMessageElement(
    '<div class="message-text">Thinking...</div>',
    "bot-message",
    "thinking"
  );
  chatBody.appendChild(incomingMessageDiv);
  generateBotResponse(incomingMessageDiv);

  // Reset file data after sending
  if (userData.file.data) {
    fileInput.value = "";
    fileUploadWrapper.querySelector("img").src = "";
    fileUploadWrapper.classList.remove("active");
    userData.file = {
      data: null,
      mime_type: null,
    };
  }
};
// Handle Enter key press
messageInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    handleOutgoingMessage(e);
  }
});
// Handle file upload
fileInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      userData.file = {
        data: e.target.result,
        mime_type: file.type,
      };
      fileUploadWrapper.querySelector("img").src = e.target.result;
      fileUploadWrapper.classList.add("active");
      // Automatically send the message when a file is selected
      handleOutgoingMessage(new Event('submit'));
    };
    reader.readAsDataURL(file);
  }
});
// Handle file cancel
fileCancelButton.addEventListener("click", () => {
  fileInput.value = "";
  fileUploadWrapper.querySelector("img").src = "";
  fileUploadWrapper.classList.remove("active");
  userData.file = {
    data: null,
    mime_type: null,
  };
});
// Handle send button click
sendMessage.addEventListener("click", handleOutgoingMessage);
// Adjust input field height dynamically
messageInput.addEventListener("input", () => {
  messageInput.style.height = `${initialInputHeight}px`;
  messageInput.style.height = `${messageInput.scrollHeight}px`;
  document.querySelector(".chat-form").style.borderRadius = messageInput.scrollHeight > initialInputHeight ? "15px" : "32px";
});
// Initialize emoji picker and handle emoji selection
const picker = new EmojiMart.Picker({
  theme: "light",
  skinTonePosition: "none",
  previewPosition: "none",
  onEmojiSelect: (emoji) => {
    const { selectionStart: start, selectionEnd: end } = messageInput;
    messageInput.setRangeText(emoji.native, start, end, "end");
    messageInput.focus();
  },
  onClickOutside: (e) => {
    if (e.target.id === "emoji-picker") {
      document.body.classList.toggle("show-emoji-picker");
    } else {
      document.body.classList.remove("show-emoji-picker");
    }
  },
});
document.querySelector(".chat-form").appendChild(picker);
document.querySelector("#file-upload").addEventListener("click", () => fileInput.click());
closeChatbot.addEventListener("click", () => document.body.classList.remove("show-chatbot"));
chatbotToggler.addEventListener("click", () => document.body.classList.toggle("show-chatbot"));

// Profile Button Functionality
const profileBtn = document.getElementById('profile-btn');

// Check if user is logged in and show profile button
async function checkUserLogin() {
  try {
    const response = await fetch('http://localhost:3000/api/profile', {
      credentials: 'include'
    });
    const result = await response.json();
    
    if (result.success) {
      // User is logged in, show profile button and hide login/signup
      profileBtn.style.display = 'inline-flex';
      document.querySelector('.login-btn').style.display = 'none';
      document.querySelector('.signup-btn').style.display = 'none';
      
      // Store user data for profile page
      window.userProfileData = result.user;
      return true;
    } else {
      // User is not logged in, show login/signup buttons
      document.querySelector('.login-btn').style.display = 'inline-block';
      document.querySelector('.signup-btn').style.display = 'inline-block';
      window.userProfileData = null;
      return false;
    }
  } catch (error) {
    console.error('Error checking user login status:', error);
    // If server is not running, show login/signup buttons
    document.querySelector('.login-btn').style.display = 'inline-block';
    document.querySelector('.signup-btn').style.display = 'inline-block';
    window.userProfileData = null;
    return false;
  }
}

// Redirect to profile.html and store user data
if (profileBtn) {
  profileBtn.addEventListener('click', function(e) {
    e.preventDefault();
    if (window.userProfileData) {
      localStorage.setItem('profileUser', JSON.stringify(window.userProfileData));
      window.location.href = 'profile.html';
    } else {
      alert('Please log in to view your profile.');
    }
  });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing profile...');
  initializeProfile();
  checkUserLogin();
});

// Logout functionality
const logoutBtn = document.getElementById('logout-btn');
logoutBtn.addEventListener('click', async () => {
  try {
    const response = await fetch('http://localhost:3000/api/logout', {
      method: 'POST',
      credentials: 'include'
    });
    const result = await response.json();
    
    if (result.success) {
      // Hide profile button and show login/signup buttons
      profileBtn.style.display = 'none';
      document.querySelector('.login-btn').style.display = 'inline-block';
      document.querySelector('.signup-btn').style.display = 'inline-block';
      
      // Close profile modal
      closeProfileModal();
      
      // Redirect to homepage
      window.location.href = 'index.html';
    }
  } catch (error) {
    console.error('Error logging out:', error);
    alert('Error logging out. Please try again.');
  }
});

// Add navigation functionality to login and signup buttons
document.querySelector('.login-btn').addEventListener('click', () => {
  window.location.href = 'login.html';
});

document.querySelector('.signup-btn').addEventListener('click', () => {
  window.location.href = 'signup.html';
});