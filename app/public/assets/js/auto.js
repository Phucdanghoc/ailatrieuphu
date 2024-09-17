$(document).ready(function () {
    let QUESTIONDATA = [];
    let CURRENTQUESTION = 0;
    let LEVEL = 1;
    let isPlaying = false;
    const audio = new Audio('http://localhost:3000/assets/sounds/HS_Q1-5.ogg');
    const correct = new Audio('http://localhost:3000/assets/sounds/C1-4---Dung.ogg')
    const incorrect = new Audio('http://localhost:3000/assets/sounds/C1-5_sai.ogg')
    function loadQuestion() {
        $.ajax({
            url: `http://localhost:3000/api/questions/play?level=${LEVEL}&number=10`,
            success: function (response) {
                QUESTIONDATA = response.data;
                if (QUESTIONDATA.length > 0) {
                    renderQuestionNumber();
                    updateQuestion(QUESTIONDATA[CURRENTQUESTION]);
                }
            },
            error: function () {
                alert('Failed to load question.');
            }
        });
    }
    
    function toggleAudio() {
        if (audio.paused) {
            // If audio is paused, play it
            audio.play().then(() => {
                isPlaying = true;
            }).catch(error => console.error('Error playing audio:', error));
        } else {
            // If audio is playing, stop and reset it
            audio.pause();
            audio.currentTime = 0;
            isPlaying = false;
        }
    }
    function correctAudio() {
        correct.play().then(() => {
            // isPlaying = true;
        }).catch(error => console.error('Error playing audio:', error));
    }
    function incorrectAudio() {
        incorrect.play().then(() => {
            // isPlaying = true;
        }).catch(error => console.error('Error playing audio:', error));
    }

    function updateQuestion(data) {
        toggleAudio();
        console.log(data)
        $('.question').fadeIn(2000).text(data.question);
        $(".media").html(generateMediaTag(data.path))
        $('.question-btn').removeClass('active');
        $('.answer-btn').removeAttr('style').removeClass('blink').text('').prop('disabled', true);
        if (CURRENTQUESTION < $('.question-btn').length) {
            $('.question-btn').eq(9 - CURRENTQUESTION).addClass('active');
        }
        
        $('.answer-btn').prop('disabled', true);
        $('.answer-btn').each(function (index) {
            const answerKey = ['A', 'B', 'C', 'D'][index];
            const answerText = data.answers[answerKey];
            setTimeout(() => {
                // Create the HTML content with the image and text
                const content = `<img src="/assets/images/diamond.png" class="icon"> ${answerKey}: ${answerText}`;
                $(this).html(content); // Set the HTML content
                $(this).data('correct', data.result === answerKey);
                $(this).removeClass('correct incorrect');
                $(this).fadeIn();
            }, index * 1000);
        });
    
        setTimeout(() => {
            checkAnswerAndProceed();
        }, 5000);
    }
    function generateMediaTag(path) {
        const ext = path.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
            return `<img src="/assets/uploads/${path}" alt="Image" style="max-width: 75%; height: auto;">`;
        } else if (['mp4', 'mov', 'webm'].includes(ext)) {
            return `
                <video controls style="max-width: 75%; height: auto;">
                    <source src="/assets/uploads/${path}" type="video/${ext}">
                    Your browser does not support the video tag.
                </video>
            `;
        } else {
            return ''; // Return an empty string if the file type is unsupported
        }
    }
    function checkAnswerAndProceed() {
        const correctAnswerBtn = $('.answer-btn').filter(function () {
            return $(this).data('correct') === true;
        });
        toggleAudio()
        correctAnswerBtn.addClass('blink');
        correctAudio()
        correctAnswerBtn.css('background-image', 'url("/assets/images/answergreencheck.png")');
        setTimeout(() => {
            CURRENTQUESTION++;
            if (CURRENTQUESTION < QUESTIONDATA.length) {
                updateQuestion(QUESTIONDATA[CURRENTQUESTION]);
            } else {
                LEVEL++;
                if (LEVEL <= 3) {
                    CURRENTQUESTION = 0;
                    loadQuestion(); 
                } else {
                    alert('You have completed all levels!');
                }
            }
        }, 3000);
    }


    function renderQuestionNumber() {
        const questionListContainer = $('.question-list');
        questionListContainer.empty();
        QUESTIONDATA.forEach(function (_, index) {
            const questionNumber = 10 * LEVEL - index;
            const button = $('<button></button>', {
                class: 'question-btn',
                text: `Câu ${questionNumber}`,
                'data-question': questionNumber
            });
            questionListContainer.append(button);
        });
    }
    audio.addEventListener('ended', function () {
        audio.currentTime = 0; // Reset the time to the beginning
        audio.play().then(() => {
            isPlaying = true;
        }).catch(error => console.error('Error replaying audio:', error));
    });
    
    // Initial question load
    loadQuestion();
});
