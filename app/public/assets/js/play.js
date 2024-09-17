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
        $('.answer-btn').each(function () {
            $(this).text('');
            $(this).removeClass('blink')
        });
        toggleAudio();

        $('.question').fadeIn(2000).text(data.question);
        if (CURRENTQUESTION < $('.question-btn').length) {
            $('.question-btn').removeClass('active');
            $('.question-btn').eq(9 - CURRENTQUESTION).addClass('active');
        }
        $('.answer-btn').each(function () {
            var $this = $(this);
            var htmlContent = $this.html();
            var newHtml = htmlContent.replace(/>([^<]+)<\/[^>]+>/g, '><img src="/assets/images/diamond.png" class="icon">');
            $this.html(newHtml);
        });
        $(".media").html(generateMediaTag(data.path))
        // Update answer buttons with a delay
        $('.answer-btn').each(function (index) {
            const answerKey = ['A', 'B', 'C', 'D'][index];
            const answerText = data.answers[answerKey];
            setTimeout(() => {
                const content = `<img src="/assets/images/diamond.png" class="icon"> ${answerKey}: ${answerText}`;
                $(this).html(content); // Set the HTML content
                $(this).data('correct', data.result === answerKey); // Store correctness
                $(this).removeClass('correct incorrect'); // Remove previous classes
                $(this).fadeIn(2000); // Example of standard jQuery animation
            }, index * 1000);
        });
    }
    function generateMediaTag(path) {
        const ext = path.split('.').pop().toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
            return `<img src="/assets/uploads/${path}" alt="Image" style="max-width: 50%; height: auto;">`;
        } else if (['mp4', 'mov', 'webm'].includes(ext)) {
            return `
                <video controls style="max-width: 50%; height: auto;">
                    <source src="/assets/uploads/${path}" type="video/${ext}">
                    Your browser does not support the video tag.
                </video>
            `;
        } else {
            return ''; // Return an empty string if the file type is unsupported
        }
    }
    $('.answer-btn').on('click', function () {
        const selectedBtn = $(this);
        const isCorrect = selectedBtn.data('correct');
        selectedBtn.css('background-image', 'url("/assets/images/answeryellowcheck.png")');
        $('.answer-btn').prop('disabled', true);
        setTimeout(() => {
            toggleAudio();
            if (isCorrect) {
                correctAudio();
                selectedBtn.addClass('blink');
                selectedBtn.css('background-image', 'url("/assets/images/answergreencheck.png")');
            } else {
                incorrectAudio();
                selectedBtn.css('background-image', 'url("/assets/images/answerredcheck.png")');
            }
            $('.answer-btn').each(function () {
                if ($(this).data('correct') && $(this).get(0) !== selectedBtn.get(0)) {
                    $(this).css('background-image', 'url("/assets/images/answergreencheck.png")');
                    $(this).addClass('blink')
                }
            });
            setTimeout(function () {
                if (isCorrect) {
                    CURRENTQUESTION++;
                    if (CURRENTQUESTION < QUESTIONDATA.length) {
                        updateQuestion(QUESTIONDATA[CURRENTQUESTION]);
                        $('.answer-btn').prop('disabled', false);
                    } else {
                        alert('No more questions.');
                    }
                } else {
                    $('.answer-btn').prop('disabled', false);
                    resetQuestion();
                }
                $('.answer-btn').css('background-image', '');
            }, 3000);
        }, 3000);
    });

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

    function resetQuestion() {
        QUESTIONDATA = [];
        CURRENTQUESTION = 0;
        LEVEL = 1;
        loadQuestion();
    }
    loadQuestion();
});