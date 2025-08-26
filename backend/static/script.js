const uploadForm = document.getElementById("uploadForm");
const pdfFileInput = document.getElementById("pdfFile");
const fileLabel = document.getElementById("fileLabel");
const uploadMessage = document.getElementById("uploadMessage");

const askForm = document.getElementById("askForm");
const questionInput = document.getElementById("question");
const loading = document.getElementById("loading");
const answerBox = document.getElementById("answer");
const recommendationBox = document.getElementById("recommendation");

// File input handling with professional feedback
pdfFileInput.addEventListener("change", function(e) {
  const file = e.target.files[0];
  const fileText = fileLabel.querySelector(".file-text");
  const fileIcon = fileLabel.querySelector(".file-icon");
  
  if (file) {
    fileText.textContent = file.name;
    fileLabel.classList.add("has-file");
    fileIcon.textContent = "✓";
  } else {
    fileText.textContent = "Choose PDF file...";
    fileLabel.classList.remove("has-file");
    fileIcon.textContent = "📄";
  }
});

// Professional message handling
function showMessage(text, isError = false) {
  uploadMessage.textContent = text;
  uploadMessage.classList.remove("hidden", "error");
  if (isError) uploadMessage.classList.add("error");
  
  // Auto-hide success messages after 4 seconds
  if (!isError) {
    setTimeout(() => {
      clearMessage();
    }, 4000);
  }
}

function clearMessage() {
  uploadMessage.classList.add("hidden");
  uploadMessage.textContent = "";
}

// Enhanced upload form handler
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessage();

  const file = pdfFileInput.files[0];
  if (!file) {
    showMessage("Please select a PDF file to upload.", true);
    return;
  }

  // Validate file type
  if (file.type !== 'application/pdf') {
    showMessage("Please select a valid PDF file.", true);
    return;
  }

  // Validate file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    showMessage("File size exceeds 10MB limit. Please select a smaller file.", true);
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  // Professional loading state
  const submitBtn = uploadForm.querySelector('.btn');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing...';
  submitBtn.style.opacity = '0.7';

  try {
    const res = await fetch("/upload", { 
      method: "POST", 
      body: formData 
    });
    
    const data = await res.json();
    
    if (data.message) {
      showMessage("✓ " + data.message);
    } else if (data.error) {
      showMessage("✗ " + data.error, true);
    } else {
      showMessage("✓ Document uploaded successfully. You can now ask questions about your policy.");
    }
  } catch (err) {
    showMessage("✗ Upload failed: " + err.message, true);
  } finally {
    // Restore button state
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
    submitBtn.style.opacity = '1';
  }
});

// Enhanced question form handler
askForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const question = questionInput.value.trim();
  if (!question) {
    questionInput.focus();
    return;
  }

  clearMessage();
  answerBox.classList.add("hidden");
  recommendationBox.classList.add("hidden");
  answerBox.innerHTML = "";
  recommendationBox.innerHTML = "";
  loading.classList.remove("hidden");

  const formData = new FormData();
  formData.append("question", question);

  // Professional loading state
  const askBtn = askForm.querySelector('.btn');
  const originalText = askBtn.textContent;
  askBtn.disabled = true;
  askBtn.textContent = 'Analyzing...';
  askBtn.style.opacity = '0.7';

  try {
    const res = await fetch("/ask", { 
      method: "POST", 
      body: formData 
    });
    
    const data = await res.json();
    loading.classList.add("hidden");

    // Professional answer display
    if (data.answer) {
      answerBox.innerHTML = `<strong>📋 Analysis Result:</strong>${data.answer}`;
      answerBox.classList.remove("hidden");
      
      // Smooth scroll to answer
      setTimeout(() => {
        answerBox.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'nearest' 
        });
      }, 200);
    } else if (data.error) {
      answerBox.innerHTML = `<strong>⚠️ Error:</strong>${data.error}`;
      answerBox.classList.remove("hidden");
    }

    // Professional recommendation display
    if (data.recommendation && data.recommendation.trim() !== "") {
      recommendationBox.innerHTML = `<strong>💡 Professional Recommendation:</strong>${data.recommendation}`;
      recommendationBox.classList.remove("hidden");
      recommendationBox.style.display = "block";
    } else {
      recommendationBox.classList.add("hidden");
      recommendationBox.style.display = "none";
    }

    // Clear question for next use
    questionInput.value = "";
    
  } catch (error) {
    loading.classList.add("hidden");
    answerBox.innerHTML = `<strong>⚠️ Connection Error:</strong>Unable to process your request. Please check your connection and try again.`;
    answerBox.classList.remove("hidden");
  } finally {
    // Restore button state
    askBtn.disabled = false;
    askBtn.textContent = originalText;
    askBtn.style.opacity = '1';
  }
});

// Enhanced keyboard shortcuts
questionInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (questionInput.value.trim()) {
      askForm.dispatchEvent(new Event('submit'));
    }
  }
});

// Professional drag and drop for file upload
const fileWrapper = document.querySelector('.file-input-wrapper');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
  fileWrapper.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
  fileWrapper.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
  fileWrapper.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
  fileLabel.style.borderColor = '#3b82f6';
  fileLabel.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
  fileLabel.style.transform = 'translateY(-2px)';
}

function unhighlight(e) {
  fileLabel.style.borderColor = 'rgba(100, 116, 139, 0.3)';
  fileLabel.style.backgroundColor = 'rgba(255, 255, 255, 0.4)';
  fileLabel.style.transform = 'translateY(0)';
}

fileWrapper.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  
  if (files.length > 0 && files[0].type === 'application/pdf') {
    pdfFileInput.files = files;
    
    // Trigger change event
    const event = new Event('change', { bubbles: true });
    pdfFileInput.dispatchEvent(event);
    
    showMessage("📄 File ready for upload: " + files[0].name);
  } else {
    showMessage("Please drop a valid PDF file.", true);
  }
}

// Professional auto-focus and UX enhancements
document.addEventListener('DOMContentLoaded', () => {
  // Subtle entrance animation delay
  setTimeout(() => {
    document.querySelector('.popup-container').style.opacity = '1';
  }, 100);
  
  // Focus management
  questionInput.addEventListener('focus', () => {
    questionInput.parentElement.style.transform = 'translateY(-2px)';
  });
  
  questionInput.addEventListener('blur', () => {
    questionInput.parentElement.style.transform = 'translateY(0)';
  });
});

// Professional error handling
window.addEventListener('online', () => {
  showMessage("🌐 Connection restored. You can continue using the application.");
});

window.addEventListener('offline', () => {
  showMessage("🌐 You appear to be offline. Please check your internet connection.", true);
});

// Enhanced visual feedback for form interactions
function addInteractionFeedback() {
  const buttons = document.querySelectorAll('.btn');
  
  buttons.forEach(button => {
    button.addEventListener('mousedown', () => {
      button.style.transform = 'translateY(-1px) scale(0.98)';
    });
    
    button.addEventListener('mouseup', () => {
      button.style.transform = 'translateY(-3px) scale(1)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0) scale(1)';
    });
  });
}

// Initialize professional interactions
addInteractionFeedback();

// Professional input validation with real-time feedback
questionInput.addEventListener('input', (e) => {
  const value = e.target.value.trim();
  const askBtn = askForm.querySelector('.btn');
  
  if (value.length > 0) {
    askBtn.style.opacity = '1';
    askBtn.style.transform = 'translateY(-2px)';
  } else {
    askBtn.style.opacity = '0.8';
    askBtn.style.transform = 'translateY(0)';
  }
});

// Professional loading messages rotation
const loadingMessages = [
  "Processing your request...",
  "Analyzing document content...",
  "Extracting relevant information...",
  "Preparing detailed response..."
];

let messageIndex = 0;
let loadingInterval;

function startLoadingMessages() {
  const loadingText = document.querySelector('.loading p');
  if (loadingText) {
    loadingInterval = setInterval(() => {
      messageIndex = (messageIndex + 1) % loadingMessages.length;
      loadingText.textContent = loadingMessages[messageIndex];
    }, 2000);
  }
}

function stopLoadingMessages() {
  if (loadingInterval) {
    clearInterval(loadingInterval);
    messageIndex = 0;
  }
}

// Update loading display to use rotating messages
const originalLoadingShow = () => {
  loading.classList.remove("hidden");
  startLoadingMessages();
};

const originalLoadingHide = () => {
  loading.classList.add("hidden");
  stopLoadingMessages();
};

// Professional file size formatter
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

pdfFileInput.addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (file) {
    fileText.textContent = "Uploaded a file ✓";
    fileLabel.classList.add("has-file");
    fileIcon.textContent = "✓";
  } else {
    fileText.textContent = "Choose PDF file...";
    fileLabel.classList.remove("has-file");
    fileIcon.textContent = "📄";
  }
});