(function() {
    // 创建Canvas元素
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);

    // 获取Canvas上下文
    const ctx = canvas.getContext('2d');

    // 存储烟花的数组
    let fireworks = [];

    // 设置Canvas样式和位置
    function setCanvasStyle() {
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.pointerEvents = 'none'; // 不影响原网页的鼠标事件
    }

    // 设置Canvas大小
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    // 初始化Canvas样式和大小
    setCanvasStyle();
    resizeCanvas();

    // 窗口大小改变时重新设置Canvas大小
    window.addEventListener('resize', function() {
        resizeCanvas();
    });

    // 鼠标点击事件监听器
    document.addEventListener('click', function(event) {
        createFirework(event.clientX, event.clientY);
    });

    // 创建烟花函数
    function createFirework(x, y) {
        fireworks.push(new Firework(x, y));
    }

    // 烟花对象构造函数
    function Firework(x, y) {
        this.x = x;
        this.y = y;
        this.particles = [];

        // 创建烟花粒子
        for (let i = 0; i < 30; i++) {
            this.particles.push(new Particle(this.x, this.y));
        }

        // 更新和绘制烟花粒子
        this.update = function() {
            for (let i = 0; i < this.particles.length; i++) {
                this.particles[i].update();
                this.particles[i].draw();
            }
        }
    }

    // 烟花粒子对象构造函数
    function Particle(x, y) {
        this.x = x + (Math.random() - 0.5) * 10; // 将烟花爆炸范围控制在鼠标周围
        this.y = y + (Math.random() - 0.5) * 10; // 将烟花爆炸范围控制在鼠标周围
        this.radius = Math.random() * 2 + 1;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
        this.velocity = {
            x: Math.random() * 6 - 3,
            y: Math.random() * 6 - 3
        };
        this.alpha = 1;

        // 更新粒子位置和透明度
        this.update = function() {
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.alpha -= 0.01;
        }

        // 绘制粒子
        this.draw = function() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // 动画循环
    function animate() {
        requestAnimationFrame(animate);
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 更新和绘制烟花
        for (let i = 0; i < fireworks.length; i++) {
            fireworks[i].update();
        }

        // 清除已消失的烟花
        fireworks = fireworks.filter(function(firework) {
            return firework.particles[0].alpha > 0;
        });
    }

    animate();

})();