let width = window.innerWidth - 35
let height = window.innerHeight - 35
if(width <= height){
    height = width
}else{
    height -= 30
}
const size_bullet = 10
const size_enemy = 10/200
const size_player = 10/64
const step = 20

const border_x = Math.round(width/2/20-1)
const border_y = Math.round(height/2/20-1)
let player_pos = [] 
let enemy_pos = []
let start, end
// player_pos = [30,9]
// enemy_pos = [[-3.3,3],[-5.2,5.2]]
// start = player_pos[0]
// end = enemy_pos[0][0]

let enemies = {} 
let player
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
const point = document.getElementById("point")
const shop_content = document.getElementById("shop-content")

if (localStorage.getItem("point") == null) localStorage.setItem("point",0)
if (localStorage.getItem("player_select") == null) localStorage.setItem("player_select",1)
if (localStorage.getItem("target_select") == null) localStorage.setItem("target_select",1)
if (localStorage.getItem("player_unlocked") == null) localStorage.setItem("player_unlocked",JSON.stringify([1]))
if (localStorage.getItem("target_unlocked") == null) localStorage.setItem("target_unlocked",JSON.stringify([1]))
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
        updatePos()
        updateShop(select_option)
        const graphics = this.add.graphics();
        // cartesian
        graphics.lineStyle(2, 0x0, 0.5);
        graphics.moveTo(width/2, 0);
        graphics.lineTo(width/2, height);
        graphics.moveTo(0, height/2);
        graphics.lineTo(width, height/2);
        graphics.strokePath();
        graphics.closePath();

        let space = (border_y).toString().length == 1 ? 10 : 20;
        this.add.text(width/2-space, 0, border_y)
        .setFont("bold 15px Arial")
        .setColor('#000000');

        this.add.text(width-space, height/2-20, border_x)
        .setFont("bold 15px Arial")
        .setColor('#000000');

        let player_select = localStorage.getItem('player_select')
        let target_select = localStorage.getItem('target_select')
        player = this.add.sprite((width/2)+player_pos[0]*step, (height/2)+(player_pos[1])*(-1)*step, `animal-${player_select}`).setScale(size_player).setOrigin(.5, .5)
        this.bullet = this.add.rectangle((width/2)+player_pos[0]*step, (height/2)+(player_pos[1])*(-1)*step, size_bullet, size_bullet, 0x0).setOrigin(.5, .5)
        this.bullet.alpha = 0

        enemy_pos.forEach((items,i) => {
            if(items != null){
                let enemy = this.add.sprite((width/2)+items[0]*step, (height/2)+(items[1])*(-1)*step, `fruit-${target_select}`).setScale(size_enemy).setOrigin(.5, .5)
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
                input.focus()
            },1000)
        }

        shoot = (arr,pos) =>{        
            try{
                arr[pos+1][0]
            }catch(e){
                restart(1000)
                return false
            }
            let next = true
            distance = arr.length > 2 ? distance : 0
            let x1 = arr[pos][0]*step
            let y1 = arr[pos][1]*step
            let x2 = arr[pos+1][0]*step
            let y2 = arr[pos+1][1]*step
            if(isNaN(y2)){
                restart(1000)
                return false
            }
            // if(arr.length <= 3) arr.push([])
            let [length,angle] = pytha(x1,y1,x2,y2)
            const coords = {x: (width/2)+x1,y: (height/2)+(y1)*(-1)+distance, len:0} 
            const tween = new TWEEN.Tween(coords, false) 
                .to({x: (width/2)+x2, y: (height/2)+(y2)*(-1)+distance, len: length}, length) 
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate((c) => {
                    graphics.moveTo((width/2)+x1, (height/2)+(y1)*(-1)+distance);
                    graphics.lineTo(c.x, c.y);
                    graphics.strokePath();
                    graphics.closePath();
                    this.bullet.x = c.x
                    this.bullet.y = c.y
                    for (const [key, enemy] of Object.entries(enemies)) {
                        if((this.bullet.x + this.bullet.scaleX+(size_bullet/2+3) >= enemy.x &&
                            this.bullet.x <= enemy.x + enemy.scaleX+(size_bullet/2+3)) && 
                            (this.bullet.y + this.bullet.scaleY+(size_bullet/2+3) >= enemy.y &&
                            this.bullet.y <= enemy.y + enemy.scaleY+(size_bullet/2+3)) &&
                            (enemy.scene != undefined)){       
                                enemy_pos[key] = null 
                                enemy.destroy()
                                updatePoint()
                                this.add.text(enemy.x, enemy.y, "Damn!!")
                                .setFont("15px Arial")
                                .setColor('#000000');
                        }
                    }
                    if((math.abs(this.bullet.x-width/2) > width/2 || math.abs(this.bullet.y-height/2) > height/2)){
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
    let val = input.value
    // if(!val.includes("x")){
    //     showToast("Equation must includes x")
    //     return false
    // }
    try{
        const res = calculate(val.toLowerCase(),width)
        res.unshift([player_pos[0],player_pos[1]])
        console.log(res)
        distance = math.abs(player_pos[1]*step - res[1][1]*step)
        distance = res[1][1] > player_pos[1] ? distance : -distance
        input.disabled = true
        shoot_btn.disabled = true
        shoot(res,1)
    }catch(err){
        showToast("Your equation is wrong")
    }
})

let buy = (i) => {
    let point = localStorage.getItem("point")
    if(select_option == "Player"){
        let player_unlocked = localStorage.getItem("player_unlocked")
        player_unlocked = JSON.parse(player_unlocked)
        if(point >= player_prices[i]){
            player_unlocked.push(i)
            localStorage.setItem("player_unlocked",JSON.stringify(player_unlocked))
            point -= player_prices[i]
            localStorage.setItem("point", point)
        }else{
            showToast("Point is not enough")
        }
    }else if(select_option == "Target"){
        let target_unlocked = localStorage.getItem("target_unlocked")
        target_unlocked = JSON.parse(target_unlocked)
        if(point >= target_prices[i].price){
            target_unlocked.push(i)
            localStorage.setItem("target_unlocked",JSON.stringify(target_unlocked))
            point -= target_prices[i].price
            localStorage.setItem("point", point)
        }else{
            showToast("Point is not enough")
        }
    }
    updateShop(select_option)
}

let select =  (i) => {
    if(select_option == "Player"){
        localStorage.setItem("player_select",i)
        player.setTexture(`animal-${i}`)
    }else{
        localStorage.setItem("target_select",i)
        for (const [key, enemy] of Object.entries(enemies)) {
            if(enemy.scene != undefined) enemy.setTexture(`fruit-${i}`)
        }
    }
    updateShop(select_option)
}

let updatePos = () => {
    if(!enemy_pos.every(element => element === null)) return false
    // player position
    let plusOrMinus = Math.random() < 0.5 ? -1 : 1;
    let player_x = Math.round((Math.random() * border_x)) * plusOrMinus 
    let player_y = Math.round((Math.random() * border_y)) * plusOrMinus 
    player_pos = [player_x,player_y]
    // enemy position
    let total = Math.round(Math.random() * 2 + 1)
    enemy_pos = []
    for(let i = 1;i<=total;i++){
        let leftOrRight = player_x > 0 ? -1 : 1
        plusOrMinus = Math.random() < 0.5 ? -1 : 1;
        let enemy_x = Math.round((Math.random() * border_x)) * leftOrRight
        let enemy_y = Math.round((Math.random() * border_y)) * plusOrMinus
        enemy_x = enemy_x == 0 ? 1 : enemy_x
        enemy_y = enemy_y == 0 ? 1 : enemy_y
        enemy_pos.push([enemy_x,enemy_y])
    }
    // update start & end
    start = player_pos[0]
    end = enemy_pos[0][0]
}

let updatePoint = () => {
    if(!enemy_pos.every(element => element === null)) return false
    let last_point = localStorage.getItem("point")
    let target_select = localStorage.getItem("target_select")
    let new_point = parseInt(last_point)+target_prices[target_select].increase
    localStorage.setItem("point",new_point)
    point.innerHTML = new_point
    updatePos()
}

let option = (el) => {
    let last_select = document.getElementsByClassName('select-option')[0]
    last_select.classList.toggle('select-option')
    el.classList.toggle("select-option");
    select_option = el.innerHTML
    updateShop(select_option)
}

let updateShop = (option) => {
    let new_element = ""
    let dir = option == "Player" ? "animal" : "fruit"
    let size = option == "Player" ? 72 : 56
    let player_unlocked = localStorage.getItem("player_unlocked")
    let target_unlocked = localStorage.getItem("target_unlocked")
    for(let i = 1;i<=20;i++){
        new_element += `<div class="shop-list">`
        new_element += `<img src="img/${dir}/${i}.svg" width="${size}"/>`
        if(option == 'Player') {
            new_element += `<span class="price">Price: ${player_prices[i]}</span><br>`
        }else {
            new_element += `<span class="price">Price: ${target_prices[i].price}</span><br>`
            new_element += `<span><b>+${target_prices[i].increase}</b> point</span><br>`      
        } 
        if(option == 'Player' && player_unlocked.includes(i)){
            let info = localStorage.getItem("player_select") == i ? "selected" : "select"
            new_element += `<button onclick="select(${i})">${info}</button>`
        }else if(option == 'Target' && target_unlocked.includes(i)){
            let info = localStorage.getItem("target_select") == i ? "selected" : "select"
            new_element += `<button onclick="select(${i})">${info}</button>`
        }else{
            new_element += `<button onclick="buy(${i})">buy</button>`
        }
        new_element += '</div>'
    }
    shop_content.innerHTML = new_element
}


let calculate = (eq,width) => {
    const dh = math.parse(eq)
    let y = []
    let i=start;
    while(math.abs(i)<width/2){
        const res = dh.evaluate({ x: i })
        if(res == Infinity || res == NaN) break; y.push([i,res])
            if(start < end){
            i+=0.5;
        }else{
            i-=0.5;
        }
        if(math.abs(res)*step > width && y.length >= 3){
            break;
        }
    }
    return y
}

let pytha = (x1,y1,x2,y2) => {
    let x = math.abs(x2-x1)
    let y = math.abs(y2-y1)
    let r = math.sqrt(x**2 + y**2)
    let angle = math.asin(y/r)*(180/math.pi)
    return [r,angle]
}

let showToast = (text) => {
    var x = document.getElementById("snackbar");
    x.innerHTML = text
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
}
function showCloseShop(){document.getElementById('shop').classList.toggle('hide')}
function showCloseInfo(){document.getElementById('info').classList.toggle('hide')}

const config = {
    type: Phaser.AUTO,
    width: width,
    height: height,
    parent: 'game-area',
    backgroundColor: '#ffffff',
    scene: Scene,
};

const game = new Phaser.Game(config);
