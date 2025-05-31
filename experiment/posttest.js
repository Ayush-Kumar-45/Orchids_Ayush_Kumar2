/////////////////////////////////////////////////////////////////////////////

/////////////////////// Do not modify the below code ////////////////////////

/////////////////////////////////////////////////////////////////////////////

(function() {
  function buildQuiz() {
    // we'll need a place to store the HTML output
    const output = [];

    // for each question...
    myQuestions.forEach((currentQuestion, questionNumber) => {
      // we'll want to store the list of answer choices
      const answers = [];

      // and for each available answer...
      for (letter in currentQuestion.answers) {
        // ...add an HTML radio button
        answers.push(
          `<label>
            <input type="radio" name="question${questionNumber}" value="${letter}">
            ${letter} :
            ${currentQuestion.answers[letter]}
          </label>`
        );
      }

      // add this question and its answers to the output
      output.push(
        `<div class="question"> ${currentQuestion.question} </div>
        <div class="answers"> ${answers.join("")} </div>`
      );
    });

    // finally combine our output list into one string of HTML and put it on the page
    quizContainer.innerHTML = output.join("");
  }

  function showResults() {
    // gather answer containers from our quiz
    const answerContainers = quizContainer.querySelectorAll(".answers");

    // keep track of user's answers
    let numCorrect = 0;

    // for each question...
    myQuestions.forEach((currentQuestion, questionNumber) => {
      // find selected answer
      const answerContainer = answerContainers[questionNumber];
      const selector = `input[name=question${questionNumber}]:checked`;
      const userAnswer = (answerContainer.querySelector(selector) || {}).value;

      // if answer is correct
      if (userAnswer === currentQuestion.correctAnswer) {
        // add to the number of correct answers
        numCorrect++;

        // color the answers green
        //answerContainers[questionNumber].style.color = "lightgreen";
      } else {
        // if answer is wrong or blank
        // color the answers red
        answerContainers[questionNumber].style.color = "red";
      }
    });

    // show number of correct answers out of total
    resultsContainer.innerHTML = `${numCorrect} out of ${myQuestions.length}`;
  }

  const quizContainer = document.getElementById("quiz");
  const resultsContainer = document.getElementById("results");
  const submitButton = document.getElementById("submit");
 

/////////////////////////////////////////////////////////////////////////////

/////////////////////// Do not modify the above code ////////////////////////

/////////////////////////////////////////////////////////////////////////////






/////////////// Write the MCQ below in the exactly same described format ///////////////


 const myQuestions = [
  {
    question: "In metallic nanowires, electrical conductivity typically:",
    answers: {
      a: "Decreases at small sizes due to electron scattering",
      b: "Increases at small sizes",
      c: "Remains constant regardless of size",
      d: "Becomes zero"
    },
    correctAnswer: "a"
  },
  {
    question: "Why do magnetic nanoparticles exhibit superparamagnetism at small sizes?",
    answers: {
      a: "The spins align perfectly at all sizes",
      b: "The material is always in a magnetic state",
      c: "Thermal fluctuations cause random alignment of spins",
      d: "Electron scattering leads to ferromagnetism"
    },
    correctAnswer: "c"
  },
  {
    question: "Which of the following is the best indicator of a nanomaterial's enhanced chemical activity?",
    answers: {
      a: "High density",
      b: "Increased atomic number",
      c: "High surface area-to-volume ratio",
      d: "Reduced lattice energy"
    },
    correctAnswer: "c"
  },
  {
    question: "In size vs property plots, non-linear variation is mostly observed due to:",
    answers: {
      a: "Classical mechanics effects",
      b: "Surface impurities",
      c: "Quantum size effects",
      d: "Constant atomic spacing"
    },
    correctAnswer: "c"
  },
  {
    question: "Which property becomes dominant in nanoparticles but is negligible in bulk materials?",
    answers: {
      a: "Volume",
      b: "Surface properties",
      c: "Atomic weight",
      d: "Gravitational interaction"
    },
    correctAnswer: "b"
  },                                  ///// To add more questions, copy the section below 
    									                  ///// this line


    /* To add more MCQ's, copy the below section, starting from open curly braces ( { )
        till closing curly braces comma ( }, )

        and paste it below the curly braces comma ( below correct answer }, ) of above 
        question

    Copy below section

    {
      question: "This is question n?",
      answers: {
        a: "Option 1",
        b: "Option 2",
        c: "Option 3",
        d: "Option 4"
      },
      correctAnswer: "c"
    },

    Copy above section

    */




  ];




/////////////////////////////////////////////////////////////////////////////

/////////////////////// Do not modify the below code ////////////////////////

/////////////////////////////////////////////////////////////////////////////


  // display quiz right away
  buildQuiz();

  // on submit, show results
  submitButton.addEventListener("click", showResults);
})();


/////////////////////////////////////////////////////////////////////////////

/////////////////////// Do not modify the above code ////////////////////////

/////////////////////////////////////////////////////////////////////////////