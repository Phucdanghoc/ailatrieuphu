$(document).ready(function () {
    let QUESTIONDATA = [];
    let CURRENTQUESTION = 0;
    let LEVEL = 1;
    const answerDelay = 1000; // 1 second delay between each answer reveal
    const answerRevealDelay = 2000; // 2 seconds delay before showing answers
    const answerCheckDelay = 2000; // 2 seconds delay before checking answers
    const audio = new Audio('http://localhost:3000/assets/sounds/HS_Q1-5.ogg');
    const correct = new Audio('http://localhost:3000/assets/sounds/C1-4---Dung.ogg');
    const incorrect = new Audio('http://localhost:3000/assets/sounds/C1-5_sai.ogg');
    let isPlaying = false;

    toggleAudio();

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
            audio.play().catch(error => console.error('Error playing audio:', error));
            isPlaying = true;
        } else {
            audio.pause();
            audio.currentTime = 0;
            isPlaying = false;
        }
    }

    function playAudio(audioFile) {
        audioFile.play().catch(error => console.error('Error playing audio:', error));
    }

    async function updateQuestion(data) {
        console.log(data.result);
        $('.question').text("");
        $('.answer-btn').empty().removeClass('blink').prop('disabled', true); // Disable buttons initially
        $('.answer-btn').prop('disabled', false).css('background-image', '');

        // Show the question with a delay
        await showQuestion(data.question);
        if (CURRENTQUESTION < $('.question-btn').length) {
            $('.question-btn').removeClass('active').eq(9 - CURRENTQUESTION).addClass('active');
        }
        // Handle media playback
        await handleMedia(data.path);

        // Add delay before showing answers
        await new Promise(resolve => setTimeout(resolve, answerRevealDelay));

        // Reveal answers
        await revealAnswers(data);

        // Add delay before checking answers
        await new Promise(resolve => setTimeout(resolve, 1000*timeCheck));

        // Update question number
  
        checkAnswerAndProceed();
    }

    function showQuestion(question) {
        return new Promise(resolve => {
            setTimeout(() => {
                $('.question').fadeIn(2000).text(question);
                resolve();
            }, 2000); // Delay before showing the question
        });
    }

    function handleMedia(path) {
        return new Promise(resolve => {
            const mediaTag = generateMediaTag(path);
            $(".media").html(mediaTag);

            const $video = $('video');
            if ($video.length) {
                $video.get(0).play();
                $video.on('ended', function () {
                    resolve(); // Resolve when the video ends
                });
            } else {
                resolve(); // Resolve immediately if there's no video
            }
        });
    }

    function revealAnswers(data) {
        const answerKeys = ['A', 'B', 'C', 'D'];
        const promises = answerKeys.map((key, index) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    const content = `<img src="/assets/images/diamond.png" class="icon"> ${key}: ${data.answers[key]}`;
                    $('.answer-btn').eq(index)
                        .html(content)
                        .data('correct', data.result === key)
                        .fadeIn(1000)
                        .prop('disabled', false);
                    resolve(); // Resolve after the answer is revealed
                }, index * answerDelay); // Delay increases with each answer
            });
        });

        return Promise.all(promises); // Wait for all answers to be revealed
    }

    function generateMediaTag(path) {
        const ext = path.split('.').pop().toLowerCase();
        const mediaSize = {
            width: '400px',
            height: '300px'
        };

        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
            return `<img src="/assets/uploads/${path}" alt="Image" style="max-width: ${mediaSize.width}; max-height: ${mediaSize.height}; width: 100%; height: auto;">`;
        } else if (['mp4', 'mov', 'webm'].includes(ext)) {
            return `
                <video controls autoplay style="max-width: ${mediaSize.width}; max-height: ${mediaSize.height}; width: 100%; height: auto;">
                    <source src="/assets/uploads/${path}" type="video/${ext}">
                    Your browser does not support the video tag.
                </video>`;
        }
        return '';
    }

    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async function checkAnswerAndProceed() {
        // console.log('Start:', new Date().toLocaleTimeString());
        // await delay(timeCheck * 1000);
        // console.log('End:', new Date().toLocaleTimeString());

        if (10 * (LEVEL - 1) + CURRENTQUESTION + 1 === incorrectAnswer) {
            const incorrectAnswerBtn = $('.answer-btn').filter(function () {
                return !$(this).data('correct');
            }).first();
            incorrectAnswerBtn.css('background-image', 'url("/assets/images/answeryellowcheck.png")');
            setTimeout(() => {
                incorrectAnswerBtn.css('background-image', 'url("/assets/images/answerredcheck.png")');
                playAudio(incorrect);
            }, 2000);
            setTimeout(resetQuiz, 3000);
            return;
        }
        const correctAnswerBtn = $('.answer-btn').filter(function () {
            return $(this).data('correct');
        });
        correctAnswerBtn.css('background-image', 'url("/assets/images/answeryellowcheck.png")');
        setTimeout(() => {
            correctAnswerBtn.addClass('blink').css('background-image', 'url("/assets/images/answergreencheck.png")');
            playAudio(correct);
        }, 2000);
        setTimeout(() => {
            CURRENTQUESTION++;
            $('.question').text("");
            $('.answer-btn').prop('disabled', false).css('background-image', '');
            if (CURRENTQUESTION < QUESTIONDATA.length) {
                updateQuestion(QUESTIONDATA[CURRENTQUESTION]);
            } else {
                LEVEL++;
                if (LEVEL <= 5) {
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
        QUESTIONDATA.forEach((_, index) => {
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
        audio.currentTime = 0;
        audio.play().catch(error => console.error('Error replaying audio:', error));
    });

    function resetQuiz() {
        QUESTIONDATA = [];
        CURRENTQUESTION = 0;
        LEVEL = 1;
        loadQuestion();
    }

    loadQuestion();
});
