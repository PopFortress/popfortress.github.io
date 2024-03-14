const name_entry = document.querySelector(".name")
const event_entry = document.querySelector(".event")
const reason_entry = document.querySelector(".reason")
const content_para = document.querySelector(".content")

function generate() {
    let name = name_entry.value
    let event = event_entry.value
    let reason = reason_entry.value
    let copy = '    ' + name + event + '是怎么回事呢？' + name + 
    '相信大家都很熟悉，但是' + name + event + '是怎么回事呢，下面就让小编带大家一起了解一下吧。\n    ' 
    + name + event + '，其实就是因为' + reason + '，大家可能会很惊讶'+ name + '怎么会' + event + 
    '呢？但事实就是这样，小编也感到非常惊讶。\n    这就是关于' + name + event + 
    '的事情了，大家有什么想法呢，欢迎在评论区告诉小编一起讨论哦！'
    console.log(copy)
    content_para.textContent = copy
}