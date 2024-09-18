$(document).ready(function () {
    let QUESTIONDATA = [];
    let CURRENTQUESTION = 0;
    let LEVEL = 1;
    const audio = new Audio('http://localhost:3000/assets/sounds/HS_Q1-5.ogg');
    const correct = new Audio('http://localhost:3000/assets/sounds/C1-4---Dung.ogg');
    const incorrect = new Audio('http://localhost:3000/assets/sounds/C1-5_sai.ogg');
    const answerDelay = 1000; // 1 second delay between each answer reveal
    const answerRevealDelay = 2000; // 2 seconds delay before showing answers

    toggleAudio();
    loadQuestion();

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
                alert('Failed to load questions.');
            }
        });
    }

    function toggleAudio() {
        if (audio.paused) {
            audio.play().catch(error => console.error('Error playing audio:', error));
        } else {
            audio.pause();
            audio.currentTime = 0;
        }
    }

    function playCorrectAudio() {
        correct.play().catch(error => console.error('Error playing audio:', error));
    }

    function playIncorrectAudio() {
        incorrect.play().catch(error => console.error('Error playing audio:', error));
    }

    async function updateQuestion(data) {
        console.log(data.result);
        $('.answer-btn').empty().removeClass('blink').prop('disabled', true); // Disable buttons initially
    
        // Function to show the question with a delay
        function showQuestion() {
            return new Promise(resolve => {
                setTimeout(() => {
                    $('.question').fadeIn(2000).text(data.question);
                    resolve();
                }, 2000); // Delay before showing the question
            });
        }
    
        // Function to handle media playback
        function handleMedia() {
            return new Promise(resolve => {
                const mediaTag = generateMediaTag(data.path);
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
    
        // Show the question, handle media, and then reveal answers
        await showQuestion(); // Wait until the question is fully shown
        await handleMedia(); // Wait until the media has finished playing
        
        // Add delay before showing answers
        setTimeout(() => {
            revealAnswers(data); // Reveal answers after the delay
        }, answerRevealDelay);
    
        // Update question number
        if (CURRENTQUESTION < $('.question-btn').length) {
            $('.question-btn').removeClass('active').eq(9 - CURRENTQUESTION).addClass('active');
        }
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
    
    function revealAnswers(data) {
        const answerKeys = ['A', 'B', 'C', 'D'];
        
        answerKeys.forEach((key, index) => {
            setTimeout(() => {
                const content = `<img src="/assets/images/diamond.png" class="icon"> ${key}: ${data.answers[key]}`;
                $('.answer-btn').eq(index)
                    .html(content)
                    .data('correct', data.result === key)
                    .fadeIn(1000)
                    .prop('disabled', false); 
            }, index * answerDelay); // Delay increases with each answer
        });
    }

    $('.answer-btn').on('click', function () {
        const selectedBtn = $(this);
        const isCorrect = selectedBtn.data('correct');
        selectedBtn.css('background-image', 'url("/assets/images/answeryellowcheck.png")');
        $('.answer-btn').prop('disabled', true);

        setTimeout(() => {
            if (isCorrect) {
                playCorrectAudio();
                selectedBtn.addClass('blink').css('background-image', 'url("/assets/images/answergreencheck.png")');
            } else {
                playIncorrectAudio();
                selectedBtn.css('background-image', 'url("/assets/images/answerredcheck.png")');
            }

            $('.answer-btn').each(function () {
                if ($(this).data('correct') && this !== selectedBtn[0]) {
                    $(this).addClass('blink').css('background-image', 'url("/assets/images/answergreencheck.png")');
                }
            });

            setTimeout(() => {
                if (isCorrect) {
                    CURRENTQUESTION++;
                    if (CURRENTQUESTION < QUESTIONDATA.length) {
                        updateQuestion(QUESTIONDATA[CURRENTQUESTION]);
                    } else {
                        levelUp(); // Call levelUp function when all questions are answered
                    }
                } else {
                    resetQuiz();
                }
                $('.question').text(""); 
                $('.answer-btn').prop('disabled', false).css('background-image', '');
            }, 3000);
        }, 3000);
    });

    function levelUp() {
        LEVEL++;
        CURRENTQUESTION = 0;
        loadQuestion();
    }

    function renderQuestionNumber() {
        const questionListContainer = $('.question-list').empty();
        QUESTIONDATA.forEach((_, index) => {
            const questionNumber = 10 * LEVEL - index;
            $('<button>', {
                class: 'question-btn',
                text: `Câu ${questionNumber}`,
                'data-question': questionNumber
            }).appendTo(questionListContainer);
        });
    }

    function resetQuiz() {
        QUESTIONDATA = [];
        CURRENTQUESTION = 0;
        LEVEL = 1;
        loadQuestion();
    }
});
