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
let select_option = "Player"

let player_prices = {
    1: 2000, 2:2000, 3:2000, 4: 2000, 5:2000, 6:3000, 7:3000, 8:3000, 9:3500, 10:3500,
    11: 4000, 12:4000, 13:5000, 14: 5000, 15:5500, 16:6000, 17:7000, 18:8000, 19:9000, 20:10000,
}

let target_prices = {
    1:{price: 2000, increase: 20}, 
    2:{price: 2000, increase: 20}, 
    3:{price: 2000, increase: 20}, 
    4:{price: 3000, increase: 30}, 
    5:{price: 3000, increase: 30}, 
    6:{price: 3500, increase: 40}, 
    7:{price: 3500, increase: 40}, 
    8:{price: 3500, increase: 40}, 
    9:{price: 4500, increase: 50}, 
    10:{price: 5000, increase: 65},
    11:{price: 5000, increase: 65}, 
    12:{price: 6500, increase: 80}, 
    13:{price: 8000, increase: 80}, 
    14:{price: 10000, increase: 95}, 
    15:{price: 14000, increase: 100}, 
    16:{price: 16000, increase: 120}, 
    17:{price: 17500, increase: 135}, 
    18:{price: 19000, increase: 150}, 
    19:{price: 21000, increase: 180}, 
    20:{price: 25000, increase: 200},
}

const input = document.getElementById("input")
const shoot_btn = document.getElementById("shoot-btn")
const form = document.getElementById("form")
const buy = document.getElementById("buy")
const point = document.getElementById("point")
const shop_content = document.getElementById("shop-content")

if (localStorage.getItem("point") == null) localStorage.setItem("point",0)
point.innerHTML = localStorage.getItem("point")

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
                                updatePoint(10)
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

let updatePoint = (add) => {
    let last_point = localStorage.getItem("point")
    let new_point = parseInt(last_point)+add
    localStorage.setItem("point",new_point)
    point.innerHTML = new_point
}

let option = (el) => {
    let last_select = document.getElementsByClassName('select-option')[0]
    last_select.classList.toggle('select-option')
    el.classList.toggle("select-option");
    select_option = el.innerHTML
    showShop(select_option)
}

let showShop = (option) => {
    let new_element = ""
    let dir = option == "Player" ? "animal" : "fruit"
    let size = option == "Player" ? 72 : 56
    for(let i = 1;i<=20;i++){
        new_element += `<div class="shop-list">`
        new_element += `<img src="img/${dir}/${i}.svg" width="${size}"/><br>`
        if(option == 'Player') new_element += `<span>price: ${player_prices[i]}</span><br>`
        else {
            new_element += `<span>price: ${target_prices[i].price}</span><br>`
            new_element += `<span>+${target_prices[i].increase} point</span><br>`      
        } 
        new_element += `<button onclick="">buy</button>`
        new_element += '</div>'
        if(i == 10) new_element += '<br><br>'
    }
    shop_content.innerHTML = new_element
}
showShop(select_option)

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

const config = {
    type: Phaser.AUTO,
    width: width,
    height: height,
    parent: 'game-area',
    backgroundColor: '#ffffff',
    scene: Scene,
};

const game = new Phaser.Game(config);
