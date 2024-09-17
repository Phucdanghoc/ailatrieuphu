$(document).ready(function () {
    const questionsPerPage = 5;
    let currentPage = 1;
    $('#backBtn').click(function() {
        window.history.back();
    });
    $('#importBtn').click(function () {
        // Get the file from the input element
        var file = $('#importFile')[0].files[0];
        
        if (file) {
            var formData = new FormData();
            formData.append('file', file);

            $.ajax({
                url: '/api/question/excel', // Adjust URL to your server endpoint
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function (response) {
                    showNotice('Câu hỏi đã được thêm thành công!', 'success');
                },
                error: function (error) {
                    showNotice('Lỗi', 'error');
                }
            });
        } else {
            showNotice('Vui lòng chọn file để nhập!', 'error');
        }
    });


    function loadQuestions(page = 1) {
        $.ajax({
            url: '/api/questions',
            method: 'GET',
            data: { page: page, limit: questionsPerPage },
            success: function (response) {
                const questions = response.data;
                $('#question-list').empty();
                questions.forEach(question => {
                    $('#question-list').append(`
                       <div class="card ${getLevelClass(question.level)}" data-code="${question._id}">
                            <div class="question">${question.question}</div>
                            <div class="grid">
                                <div class="option">A: ${question.answers.A}</div>
                                <div class="option">B: ${question.answers.B}</div>
                                <div class="option">C: ${question.answers.C}</div>
                                <div class="option">D: ${question.answers.D}</div>
                            </div>
                            <div class="answer">Đáp án đúng: ${question.result}</div>
                            <div class="answer">
                                ${question.path ? generateMediaTag(question.path) : ''}
                            </div>
                        </div>
                    `);
                });
                $('#pageInfo').text(`Trang ${currentPage}`);
            },
            error: function (error) {
                alert('Error loading questions');
            }
        });
    }

    $('#refreshBtn').click(function () {
        loadQuestions(currentPage);
    });

    $('#addBtn').click(function () {
        const fileInput = $('#mediaFile')[0];  // Correct ID
        var fileName = ""
        if (fileInput.files.length > 0) {
            fileName = fileInput.files[0].name;
        }
        // Add other form data
        const updatedQuestion = {
            question: $('#cauHoi').val(),
            answers: {
                A: $('#luaChon').val().split('\n')[0],
                B: $('#luaChon').val().split('\n')[1],
                C: $('#luaChon').val().split('\n')[2],
                D: $('#luaChon').val().split('\n')[3]
            },
            result: $('#dapAn').val(),
            level: $('#doKho').val(),
            path: fileName
        };


        $.ajax({
            url: '/api/questions',
            method: 'POST',
            data: JSON.stringify(updatedQuestion),
            contentType: 'application/json',
            processData: false,
            success: function (response) {
                console.log(response);
                showNotice('Câu hỏi đã được thêm thành công!', 'success');
                loadQuestions(currentPage);
            },
            error: function (error) {
                showNotice('Lỗi khi thêm câu hỏi.', 'error');
            }
        });
    });
    function showNotice(message, type) {
        const notice = $('#notice');
        notice.text(message);
        notice.removeClass();
        notice.addClass(type);
        notice.show();
        setTimeout(function () {
            notice.fadeOut();
        }, 10000);
    }

    $('#updateBtn').click(function () {
        const fileInput = $('#mediaFile')[0];
        var fileName = $('#filename').val();
        if (fileInput.files.length > 0) {
            fileName = fileInput.files[0].name 
        }
        console.log($('#filename').val())
        
        const updatedQuestion = {
            question: $('#cauHoi').val(),
            answers: {
                A: $('#luaChon').val().split('\n')[0],
                B: $('#luaChon').val().split('\n')[1],
                C: $('#luaChon').val().split('\n')[2],
                D: $('#luaChon').val().split('\n')[3]
            },
            result: $('#dapAn').val(),
            level: $('#doKho').val(),
            path: fileName
        };
        $.ajax({
            url: '/api/questions/' + $('#_id').val(),
            method: 'PUT',
            data: JSON.stringify(updatedQuestion),
            contentType: 'application/json',
            success: function (response) {
                // alert(response.message);
                showNotice("Cập nhật thành công", "success")
                console.log(currentPage)
                loadQuestions(currentPage);
            },
            error: function (error) {
                showNotice('Lỗi khi cập nhật câu hỏi.', 'error');
            }
        });
    });

    $('#deleteBtn').click(function () {
        $.ajax({
            url: '/api/questions/' + $('#_id').val(),
            method: 'DELETE',
            success: function (response) {
                // alert(response.message);
                showNotice("Xóa thành công", "success")

                loadQuestions(currentPage);
            },
            error: function (error) {
                // alert('Error deleting question');
                showNotice('Lỗi khi xóa câu hỏi.', 'error');

            }
        });
    });

    $('#searchBtn').click(function () {
        const searchQuery = $('#searchInput').val();
        $.ajax({
            url: '/api/questions/search',
            method: 'GET',
            data: { q: searchQuery, page: currentPage, limit: questionsPerPage },
            success: function (response) {
                const questions = response.data;
                $('#question-list').empty();
                questions.forEach(question => {
                    $('#question-list').append(`
                        <div class="card ${getLevelClass(question.level)}" data-code="${question._id}">
                            <div class="question">${question.question}</div>
                            <div class="grid">
                                <div class="option">A: ${question.answers.A}</div>
                                <div class="option">B: ${question.answers.B}</div>
                                <div class="option">C: ${question.answers.C}</div>
                                <div class="option">D: ${question.answers.D}</div>
                            </div>
                            <div class="answer">Đáp án đúng: ${question.result}</div>
                            <div class="answer">
                                ${question.path ? generateMediaTag(question.path) : ''}
                            </div>
                        </div>
                    `);

                });
            },
            error: function (error) {
                alert('Error searching questions');
            }
        });
    });
    function getLevelClass(level) {
        console.log(level)
        switch (parseInt(level)) {
            case 1:
            case 2:
                return 'level-1'; // or 'level-2' based on your preference
            case 3:
            case 4:
                return 'level-3'; // or 'level-4' based on your preference
            case 5:
                return 'level-5';
            default:
                return '';
        }
    }

    function generateMediaTag(path) {
        // Extract file extension from path
        const ext = path.split('.').pop().toLowerCase();

        // Determine whether to use img or video based on the extension
        if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) {
            return `<img src="/assets/uploads/${path}" alt="Image" style="max-width: 200px; height: auto;">`;
        } else if (['mp4', 'mov', 'webm'].includes(ext)) {
            return `
                <video controls style="max-width: 200px; height: auto;">
                    <source src="/assets/uploads/${path}" type="video/${ext}">
                    Your browser does not support the video tag.
                </video>
            `;
        } else {
            return ''; // Return an empty string if the file type is unsupported
        }
    }
    // Pagination controls
    $('#prevPage').click(function () {
        if (currentPage > 1) {
            currentPage--;
            loadQuestions(currentPage);
        }
    });

    $('#nextPage').click(function () {
        currentPage++;
        loadQuestions(currentPage);
    });

    // Load questions on page load
    loadQuestions(currentPage);

    // Fill form when card is clicked
    $(document).on('click', '.card', function () {
        const code = $(this).data('code');
        console.log('Clicked card code:', code); // Add this line to debug

        $.ajax({
            url: '/api/questions/' + code,
            method: 'GET',
            success: function (response) {
                const question = response.data;
                console.log(question.path);
                $('#_id').val(code);
                $('#doKho').val(question.level);
                $('#cauHoi').val(question.question);
                $('#luaChon').val(`${question.answers.A}\n${question.answers.B}\n${question.answers.C}\n${question.answers.D}`);
                $('#dapAn').val(question.result);
                $('#filename').val(question.path);
                $('#mediaFile').val('');
            },
            error: function (error) {
                // alert('Error loading question details');
            }
        });
    });

});