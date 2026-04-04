// contains logic for comments page
const commentsList = $('.comments__list');
const repliesDialog = $('.comments__replies_dialog');
const repliesList = $('.comments__replies_list');

let songId;

class Comment {
    constructor(options) {
        this.avatar = options.avatar;
        this.nickname = options.nickname;
        this.content = options.content;
        this.datetime = options.datetime;
        this.beReplied = options.beReplied || null; // Comment || null
        this.id = options.id;
        this.hasReplies = options.hasReplies || false;
    };
    render() {
        const commentWrapper = document.createElement('div');
        commentWrapper.className = 'comments__wrapper';
        
        const avatarWrapper = document.createElement('div');
        avatarWrapper.className = 'comments__avatar_wrapper';
        const avatar = document.createElement('mdui-avatar');
        avatar.className = 'comments__avatar';
        avatar.src = this.avatar;
        
        const contentsWrapper = document.createElement('div');
        contentsWrapper.className = 'comments__contents_wrapper';
        const nickname = document.createElement('div');
        nickname.className = 'comments__nickname';
        nickname.innerText = this.nickname;
        const content = document.createElement('div');
        content.className = 'comments__content';
        content.innerText = this.content;
        const datetime = document.createElement('div');
        datetime.className = 'comments__datetime';
        datetime.innerText = this.datetime;

        avatarWrapper.appendChild(avatar);
        commentWrapper.appendChild(avatarWrapper);
        contentsWrapper.appendChild(nickname);
        contentsWrapper.appendChild(content);

        if (this.beReplied) {
            const quoteWrapper = document.createElement('div');
            quoteWrapper.className = 'comments__quote_wrapper';
            quoteWrapper.innerText = `@${this.beReplied.nickname}：${this.beReplied.content}`;
            contentsWrapper.appendChild(quoteWrapper);
        };

        if (this.hasReplies) {
            const viewRepliesBtn = document.createElement('mdui-button');
            viewRepliesBtn.className = 'comments__view_replies_btn';
            viewRepliesBtn.variant = 'text';
            viewRepliesBtn.endIcon = 'keyboard_arrow_right';
            viewRepliesBtn.innerText = '阅读回复';
            viewRepliesBtn.onclick = () => this.loadReplies(this.id);
            contentsWrapper.appendChild(viewRepliesBtn);
        };

        contentsWrapper.appendChild(datetime);
        commentWrapper.appendChild(contentsWrapper);
        return commentWrapper;
    };
    loadReplies(parentCommentId) {
        repliesDialog.open = true;
        if (songId) {
            xhr.open('GET', `${apiServer}/comment/floor%3FparentCommentId=${parentCommentId}&id=${songId}&type=0`);
            xhr.send();
            xhr.onload = function () {
                const data = JSON.parse(xhr.responseText);
                const replies = data.data.comments;
                const ownerComment = data.data.ownerComment;
                repliesList.innerHTML = '';
                const oldOwnerComment = $('.comments__replies__owner_comment');
                if (oldOwnerComment) {
                    oldOwnerComment.remove();
                };
                const ownerCommentInstance = new Comment({
                    avatar: ownerComment.user.avatarUrl,
                    nickname: ownerComment.user.nickname,
                    content: ownerComment.content,
                    datetime: ownerComment.timeStr,
                    id: ownerComment.commentId,
                    hasReplies: false,
                });
                const ownerCommentEle = ownerCommentInstance.render();
                ownerCommentEle.classList.add('comments__replies__owner_comment');
                repliesList.before(ownerCommentEle);

                replies.forEach(reply => {
                    const replyInstance = new Comment({
                        avatar: reply.user.avatarUrl,
                        nickname: reply.user.nickname,
                        content: reply.content,
                        datetime: reply.timeStr,
                        id: reply.commentId,
                        hasReplies: false,
                    });
                    const replyEle = replyInstance.render();
                    repliesList.appendChild(replyEle);
                });
            };
        };
    };
};

function loadComments() {
    if (player.getCurrentSong()) {
        songId = player.getCurrentSong().id;
    };
    if (songId) {
        xhr.open('GET', `${apiServer}/comment/music%3Fid=${songId}`);
        xhr.send();
        xhr.onload = function () {
            const data = JSON.parse(xhr.responseText);
            const comments = data.hotComments;
            data.comments.forEach(comment => {
                comments.push(comment);
            });

            commentsList.innerHTML = '';

            comments.forEach(comment => {
                let beRepliedInstance;
                if (comment.beReplied.length > 0) {
                    const beReplied = comment.beReplied[0];
                    beRepliedInstance = new Comment({
                        avatar: beReplied.user.avatarUrl,
                        nickname: beReplied.user.nickname,
                        content: beReplied.content || '评论已被删除',
                        datetime: beReplied.timeStr,
                        id: beReplied.commentId,
                        hasReplies: false,
                    });
                };
                 const commentInstance = new Comment({
                    avatar: comment.user.avatarUrl,
                    nickname: comment.user.nickname,
                    content: comment.content,
                    datetime: comment.timeStr,
                    beReplied: beRepliedInstance,
                    id: comment.commentId,
                    hasReplies: true,
                });

                const commentEle = commentInstance.render();
                commentsList.appendChild(commentEle);
            });
        };
    };
};