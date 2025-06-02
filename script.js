// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const homeBtn = document.getElementById('home-btn');
const categorySelect = document.getElementById('category');
const difficultySelect = document.getElementById('difficulty');
const scoreElement = document.getElementById('score');
const currentQuestionElement = document.getElementById('current-question');
const totalQuestionsElement = document.getElementById('total-questions');
const questionElement = document.getElementById('question');
const optionsContainer = document.getElementById('options');
const timeElement = document.getElementById('time');
const finalScoreElement = document.getElementById('final-score');
const correctAnswersElement = document.getElementById('correct-answers');
const incorrectAnswersElement = document.getElementById('incorrect-answers');

// Game State
let currentQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let correctAnswers = 0;
let incorrectAnswers = 0;
let timer;
let timeLeft;

// Initialize Quiz Service
const quizService = new QuizService();

// Initialize Categories
async function initCategories() {
    const categories = await quizService.getCategories();
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
    });
}

// Start Quiz
startBtn.addEventListener('click', startQuiz);

async function startQuiz() {
    const category = categorySelect.value;
    const difficulty = difficultySelect.value;
    
    // Show loading indicator
    startBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
    startBtn.disabled = true;
    
    // Fetch questions
    currentQuestions = await quizService.getQuestions(10, category, difficulty);
    
    if (currentQuestions.length === 0) {
        alert('Failed to load questions. Please try again.');
        startBtn.innerHTML = 'Start Quiz';
        startBtn.disabled = false;
        return;
    }
    
    // Reset game state
    currentQuestionIndex = 0;
    score = 0;
    correctAnswers = 0;
    incorrectAnswers = 0;
    scoreElement.textContent = score;
    
    // Hide start screen, show quiz screen
    startScreen.classList.remove('active');
    quizScreen.classList.add('active');
    
    // Start first question
    loadQuestion();
}

// Load question
function loadQuestion() {
    // Reset timer
    clearInterval(timer);
    
    const currentQuestion = currentQuestions[currentQuestionIndex];
    
    // Update question count
    currentQuestionElement.textContent = currentQuestionIndex + 1;
    totalQuestionsElement.textContent = currentQuestions.length;
    
    // Set question text
    questionElement.textContent = decodeHtmlEntities(currentQuestion.question);
    
    // Clear options
    optionsContainer.innerHTML = '';
    
    // Combine correct and incorrect answers
    const options = [...currentQuestion.incorrect_answers];
    const correctIndex = Math.floor(Math.random() * (options.length + 1));
    options.splice(correctIndex, 0, currentQuestion.correct_answer);
    
    // Create option elements
    options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('option');
        optionElement.dataset.index = index;
        optionElement.dataset.correct = index === correctIndex;
        
        const prefix = document.createElement('div');
        prefix.classList.add('option-prefix');
        prefix.textContent = String.fromCharCode(65 + index); // A, B, C, D
        
        const text = document.createElement('div');
        text.classList.add('option-text');
        text.textContent = decodeHtmlEntities(option);
        
        optionElement.appendChild(prefix);
        optionElement.appendChild(text);
        
        optionElement.addEventListener('click', selectOption);
        optionsContainer.appendChild(optionElement);
    });
    
    // Start timer
    timeLeft = 30;
    timeElement.textContent = timeLeft;
    
    timer = setInterval(() => {
        timeLeft--;
        timeElement.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            handleTimeout();
        }
    }, 1000);
}

// Handle option selection
function selectOption(e) {
    clearInterval(timer);
    
    const selectedOption = e.currentTarget;
    const isCorrect = selectedOption.dataset.correct === 'true';
    
    // Disable all options
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.removeEventListener('click', selectOption);
        if (option.dataset.correct === 'true') {
            option.classList.add('correct');
        }
    });
    
    // Add class to selected option
    if (isCorrect) {
        selectedOption.classList.add('correct');
        score += timeLeft * 10;
        correctAnswers++;
    } else {
        selectedOption.classList.add('incorrect');
        incorrectAnswers++;
    }
    
    // Update score
    scoreElement.textContent = score;
    
    // Move to next question after delay
    setTimeout(() => {
        currentQuestionIndex++;
        
        if (currentQuestionIndex < currentQuestions.length) {
            loadQuestion();
        } else {
            showResults();
        }
    }, 1500);
}

// Handle timeout
function handleTimeout() {
    // Disable all options
    const options = document.querySelectorAll('.option');
    options.forEach(option => {
        option.removeEventListener('click', selectOption);
        if (option.dataset.correct === 'true') {
            option.classList.add('correct');
        } else {
            option.classList.add('incorrect');
        }
    });
    
    incorrectAnswers++;
    
    // Move to next question after delay
    setTimeout(() => {
        currentQuestionIndex++;
        
        if (currentQuestionIndex < currentQuestions.length) {
            loadQuestion();
        } else {
            showResults();
        }
    }, 1500);
}

// Show results
function showResults() {
    quizScreen.classList.remove('active');
    resultsScreen.classList.add('active');
    
    finalScoreElement.textContent = score;
    correctAnswersElement.textContent = correctAnswers;
    incorrectAnswersElement.textContent = incorrectAnswers;
}

// Restart quiz
restartBtn.addEventListener('click', () => {
    resultsScreen.classList.remove('active');
    quizScreen.classList.add('active');
    currentQuestionIndex = 0;
    score = 0;
    correctAnswers = 0;
    incorrectAnswers = 0;
    scoreElement.textContent = score;
    loadQuestion();
});

// Go home
homeBtn.addEventListener('click', () => {
    resultsScreen.classList.remove('active');
    startScreen.classList.add('active');
    startBtn.innerHTML = 'Start Quiz';
    startBtn.disabled = false;
});

// Helper function to decode HTML entities
function decodeHtmlEntities(text) {
    const textArea = document.createElement('textarea');
    textArea.innerHTML = text;
    return textArea.value;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initCategories();
});
