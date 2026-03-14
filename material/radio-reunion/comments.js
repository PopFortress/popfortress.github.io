// contains logic for comments page
const commentsList = $('.comments__list');

let songId;

function loadComments() {
    if (player.getCurrentSong()) {
        songId = player.getCurrentSong().id;
    };
    if (songId) {
        xhr.open('GET', `${apiServer}/comment/music?id=${songId}`);
        xhr.send();
        xhr.onload = function () {
            const data = JSON.parse(xhr.responseText);
            const comments = data.hotComments;
            data.comments.forEach(comment => {
                comments.push(comment);
            });

            commentsList.innerHTML = '';

            comments.forEach(comment => {
                const commentWrapper = document.createElement('div');
                commentWrapper.className = 'comments__wrapper';
                
                const avatarWrapper = document.createElement('div');
                avatarWrapper.className = 'comments__avatar_wrapper';
                const avatar = document.createElement('mdui-avatar');
                avatar.className = 'comments__avatar';
                avatar.src = comment.user.avatarUrl;
                
                const contentsWrapper = document.createElement('div');
                contentsWrapper.className = 'comments__contents_wrapper';
                const nickname = document.createElement('div');
                nickname.className = 'comments__nickname';
                nickname.innerText = comment.user.nickname;
                const content = document.createElement('div');
                content.className = 'comments__content';
                content.innerText = comment.content;
                const datetime = document.createElement('div');
                datetime.className = 'comments__datetime';
                datetime.innerText = comment.timeStr;

                avatarWrapper.appendChild(avatar);
                contentsWrapper.appendChild(nickname);
                contentsWrapper.appendChild(content);
                if (comment.beReplied.length > 0) {
                    const quoteWrapper = document.createElement('div');
                    quoteWrapper.className = 'comments__quote_wrapper';
                    quoteWrapper.innerText = `@${comment.beReplied[0].user.nickname}：${comment.beReplied[0].content}`;
                    contentsWrapper.appendChild(quoteWrapper);
                };
                contentsWrapper.appendChild(datetime);
                commentWrapper.appendChild(avatarWrapper);
                commentWrapper.appendChild(contentsWrapper);
                commentsList.appendChild(commentWrapper);
            });
        };
    };
};