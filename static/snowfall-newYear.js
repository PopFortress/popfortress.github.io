// 创建雪花元素
function createSnowflake() {
    var snowflake = document.createElement("div");
    snowflake.className = "snowflake";
    document.body.appendChild(snowflake);
    // 设置随机位置
    snowflake.style.left = Math.random() * window.innerWidth + "px";
    // 设置随机动画延迟
    snowflake.style.animationDelay = Math.random() * 5 + "s";
    // 移除元素
    setTimeout(function() {
      document.body.removeChild(snowflake);
    }, 5000);
  }
  
  // 定时创建雪花
  setInterval(createSnowflake, 100);