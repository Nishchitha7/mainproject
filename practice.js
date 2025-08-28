const stages = [
  {
    title: "Stage 1 – Aptitude Test",
    questions: [
      {
        question: "What is the next number in the sequence: 2, 4, 8, 16, ?",
        options: ["18", "24", "32", "64"],
        answer: 2,
        explanation: "Each number is multiplied by 2. So, 16 x 2 = 32."
      },
      {
        question: "Which word is the odd one out? Cat, Dog, Cow, Car",
        options: ["Cat", "Dog", "Cow", "Car"],
        answer: 3,
        explanation: "Car is not an animal."
      }
    ]
  },
  {
    title: "Stage 2 – Technical Test",
    questions: [
      {
        question: "Which language is used for web apps?",
        options: ["Python", "JavaScript", "C++", "Java"],
        answer: 1,
        explanation: "JavaScript is the main language for web apps."
      },
      {
        question: "Write a Python program to reverse a string.",
        options: [],
        answer: null,
        explanation: "Example: s = 'hello'; print(s[::-1])"
      }
    ]
  },
  {
    title: "Stage 3 – Technical Interview Simulation",
    questions: [
      {
        question: "Explain OOP concepts with examples.",
        options: [],
        answer: null,
        explanation: "Look for keywords like class, object, inheritance, encapsulation, polymorphism."
      },
      {
        question: "Tell me about your final-year project.",
        options: [],
        answer: null,
        explanation: "Look for clarity, project description, technologies used, challenges faced."
      }
    ]
  },
  {
    title: "Stage 4 – HR Interview Simulation",
    questions: [
      {
        question: "Tell me about yourself.",
        options: [],
        answer: null,
        explanation: "Feedback on grammar, clarity, and completeness."
      },
      {
        question: "Why should we hire you?",
        options: [],
        answer: null,
        explanation: "Feedback on confidence, grammar, and completeness."
      }
    ]
  }
];

let currentStage = 0;
let currentQuestion = 0;
let score = 0;
let answers = [];

function renderStage() {
  const app = document.getElementById('practiceApp');
  const stage = stages[currentStage];
  const q = stage.questions[currentQuestion];
  app.innerHTML = `
    <div class="stage-title">${stage.title}</div>
    <div class="question">${q.question}</div>
    <form id="answerForm">
      <div class="options">
        ${q.options.length > 0 ? q.options.map((opt, i) => `<label><input type="radio" name="option" value="${i}"> ${opt}</label>`).join('') : '<textarea name="textAnswer" rows="3" style="width:100%;margin-top:10px;" placeholder="Type your answer..."></textarea>'}
      </div>
      <button class="btn" type="submit">Submit</button>
    </form>
    <div class="feedback" id="feedback"></div>
  `;
  document.getElementById('answerForm').onsubmit = function(e) {
    e.preventDefault();
    let feedback = '';
    if (q.options.length > 0) {
      const selected = document.querySelector('input[name="option"]:checked');
      if (!selected) {
        feedback = 'Please select an option.';
        document.getElementById('feedback').textContent = feedback;
        return;
      }
      const selectedIndex = parseInt(selected.value);
      answers.push({stage: currentStage, question: currentQuestion, answer: selectedIndex});
      if (selectedIndex === q.answer) {
        score++;
        feedback = 'Correct!';
      } else {
        feedback = `Wrong. ${q.explanation}`;
      }
    } else {
      const text = document.querySelector('textarea[name="textAnswer"]').value.trim();
      answers.push({stage: currentStage, question: currentQuestion, answer: text});
      if (text.length < 5) {
        feedback = 'Please provide a more complete answer.';
        document.getElementById('feedback').textContent = feedback;
        return;
      }
      feedback = `Submitted. ${q.explanation}`;
    }
    document.getElementById('feedback').textContent = feedback;
    setTimeout(() => {
      nextQuestion();
    }, 1200);
  };
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion >= stages[currentStage].questions.length) {
    currentStage++;
    currentQuestion = 0;
  }
  if (currentStage < stages.length) {
    renderStage();
  } else {
    showSummary();
  }
}

function showSummary() {
  const app = document.getElementById('practiceApp');
  app.innerHTML = `
    <div class="stage-title">Simulation Complete!</div>
    <div class="summary">
      <p><b>Total Score:</b> ${score} / ${stages[0].questions.length + stages[1].questions.filter(q => q.options.length > 0).length}</p>
      <p><b>Strengths:</b> ${score > 2 ? 'Good aptitude and technical basics.' : 'Needs improvement.'}</p>
      <p><b>Areas to Improve:</b> ${score < 4 ? 'Practice more technical and HR questions.' : 'Great job!'}</p>
      <p><b>Suggested Resources:</b> <a href="https://www.geeksforgeeks.org/">GeeksforGeeks</a>, <a href="https://www.interviewbit.com/">InterviewBit</a></p>
    </div>
    <button class="btn" onclick="window.location.href='index.html'">Back to Home</button>
  `;
}

// Start simulation
renderStage();
