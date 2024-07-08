let width = window.innerWidth - 50
let height = window.innerHeight - 50
if(width <= height){
    height = width
}
const size_bullet = 10
const size_enemy = 10/200
const size_player = 10/64
const step = 20

const player_pos = [-2,-2]
let enemy_pos = [[3.4,3],[5.2,5.2]]
let start = player_pos[0]
let end = enemy_pos[0][0]
let player,bullet
let enemies = {} 

function calculate(eq,width){
    const dh = math.parse(eq)
    let y = []
    let i=start;
    while(math.abs(i)<width/2){
        const res = dh.evaluate({ x: i })
        if(res == Infinity) break; y.push([i,res])
        if(start < end){
            i+=0.5;
        }else{
            i-=0.5;
        }
        if(math.abs(res)*step > width && y.length >= 2){
            break;
        }
    }
    return y
}

function pytha(x1,y1,x2,y2){
    let x = math.abs(x2-x1)
    let y = math.abs(y2-y1)
    let r = math.sqrt(x**2 + y**2)
    let angle = math.asin(y/r)*(180/math.pi)
    return [r,angle]
}

const input = document.getElementById("input")
const shoot_btn = document.getElementById("shoot-btn")
const form = document.getElementById("form")
const buy = document.getElementById("buy")
const score = document.getElementById("score")

if (localStorage.getItem("score") == null) localStorage.setItem("score",0)
score.innerHTML = localStorage.getItem("score")

let distance = 0
let shoot = (arr,pos) => {}
let restart = () => {}


class Scene extends Phaser.Scene
{
    preload ()
    {
        for(let i = 1;i<=20;i++){
            this.load.image(`animal-${i}`, `img/animal/${i}.svg`)
            this.load.image(`fruit-${i}`, `img/fruit/${i}.svg`)
        }
    }

    create ()
    {
        const graphics = this.add.graphics();
        // cartesian
        graphics.lineStyle(2, 0x0, 1);
        graphics.moveTo(width/2, 0);
        graphics.lineTo(width/2, height);
        graphics.moveTo(0, height/2);
        graphics.lineTo(width, height/2);
        graphics.strokePath();
        graphics.closePath();

        player = this.add.sprite((width/2)+player_pos[0]*step, (height/2)+(player_pos[1])*(-1)*step, 'animal-1').setScale(size_player).setOrigin(.5, .5)
        bullet = this.add.rectangle((width/2)+player_pos[0]*step, (height/2)+(player_pos[1])*(-1)*step, size_bullet, size_bullet, 0x0).setOrigin(.5, .5)
        bullet.alpha = 0

        enemy_pos.forEach((items,i) => {
            if(items != null){
                let enemy = this.add.sprite((width/2)+items[0]*step, (height/2)+(items[1])*(-1)*step, 'fruit-1').setScale(size_enemy).setOrigin(.5, .5)
                enemies[i] = enemy
            }
        });
    }

    update(){
        player.depth = 1

        const graphics = this.add.graphics();
        graphics.lineStyle(2, 0x0, 1);

        restart = () => {
            setTimeout(() => {
                input.disabled = false
                shoot_btn.disabled = false
                this.scene.start()
            },1000)
        }

        shoot = (arr,pos) =>{        
            let next = true
            distance = arr.length > 2 ? distance : 0
            let x1 = arr[pos][0]*step
            let y1 = arr[pos][1]*step
            let x2 = arr[pos+1][0]*step
            let y2 = arr[pos+1][1]*step
            if(arr.length <= 3) arr.push([])
            let [length,angle] = pytha(x1,y1,x2,y2)
            length = x1 <= x2 ? length : -length;
            const coords = {x: (width/2)+x1,y: (height/2)+(y1)*(-1)+distance, len:0} 
            const tween = new TWEEN.Tween(coords, false) 
                .to({x: (width/2)+x2, y: (height/2)+(y2)*(-1)+distance, len: length}, length) 
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate((c) => {
                    graphics.moveTo((width/2)+x1, (height/2)+(y1)*(-1)+distance);
                    graphics.lineTo(c.x, c.y);
                    graphics.strokePath();
                    graphics.closePath();
                    bullet.x = c.x
                    bullet.y = c.y
                    for (const [key, enemy] of Object.entries(enemies)) {
                        if((bullet.x + bullet.scaleX+(size_bullet/2+2) >= enemy.x &&
                            bullet.x <= enemy.x + enemy.scaleX+(size_bullet/2+2)) && 
                            (bullet.y + bullet.scaleY+(size_bullet/2+2) >= enemy.y &&
                            bullet.y <= enemy.y + enemy.scaleY+(size_bullet/2+2)) &&
                            (enemy.scene != undefined)){       
                                enemy_pos[key] = null 
                                enemy.destroy()
                                updateScore(10)
                                this.add.text(enemy.x, enemy.y, "Damn!!")
                                .setFont("15px Arial")
                                .setColor('#000000');
                        }
                    }
                    if((math.abs(bullet.x-width/2) > width/2 || math.abs(bullet.y-height/2) > height/2) ||
                        (pos+1 >= arr.length)){
                        next = false
                        restart(1000)
                        return false
                    }
                })
                .onComplete(() => {                    
                    if(next) shoot(arr,pos+1)
                })
                .start() // Start the tween immediately.

            // Setup the animation loop.
            function animate(time) {
                tween.update(time)
                requestAnimationFrame(animate)
            }
            requestAnimationFrame(animate)
        }
    }
}

form.addEventListener("submit", (e) => {
    e.preventDefault()
    const val = input.value
    if(!val.includes("x")){
        console.log("harus mengandung x")
        return false
    }
    try{
        const res = calculate(val,width)
        res.unshift([player_pos[0],player_pos[1]])
        distance = math.abs(player_pos[1]*step - res[1][1]*step)
        distance = res[1][1] > player_pos[1] ? distance : -distance
        input.disabled = true
        shoot_btn.disabled = true
        shoot(res,1)
    }catch(err){
        console.log(err)
    }
})

function updateScore(add){
    let last_score = localStorage.getItem("score")
    let new_score = parseInt(last_score)+add
    localStorage.setItem("score",new_score)
    score.innerHTML = new_score
}

const config = {
    type: Phaser.AUTO,
    width: width,
    height: height,
    parent: 'game-area',
    backgroundColor: '#ffffff',
    scene: Scene,
};

const game = new Phaser.Game(config);
