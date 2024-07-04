const width = window.innerWidth - 50
const height = window.innerHeight - 50
const size = 10
const step = 20

function calculate(eq,width,height,start,end){
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


class Scene extends Phaser.Scene
{
    preload ()
    {
        
    }

    create ()
    {
        const player_pos = [0,0]
        const enemy_pos = [[1.7,3],[5.2,5.2]]
        // const enemy_pos = [[1.7,3]]
        let distance = 0

        const graphics = this.add.graphics();
        // cartesian
        graphics.lineStyle(2, 0x0, 0.5);
        graphics.moveTo(width/2, 0);
        graphics.lineTo(width/2, height);
        graphics.moveTo(0, height/2);
        graphics.lineTo(width, height/2);
        graphics.strokePath();
        graphics.closePath();

        const player = this.add.rectangle((width/2)+player_pos[0]*step, (height/2)+(player_pos[1])*(-1)*step, size, size, 0x0).setOrigin(.5, .5)
        const bullet = this.add.rectangle((width/2)+player_pos[0]*step, (height/2)+(player_pos[1])*(-1)*step, size, size, 0x0).setOrigin(.5, .5)
        bullet.alpha = 0

        let enemies = {} 
        enemy_pos.forEach((items,i) => {
            let enemy = this.add.rectangle((width/2)+items[0]*step, (height/2)+(items[1])*(-1)*step, size, size, 0x0).setOrigin(.5, .5)
            enemies[i] = enemy
        });

        const input = document.getElementById("input")
        const shoot_btn = document.getElementById("shoot-btn")
        const restart_btn = document.getElementById("restart-btn")
        const form = document.getElementById("form")

        let restart = (time) => {
            setTimeout(() => {
                restart_btn.disabled = true
                input.disabled = false
                shoot_btn.disabled = false
                this.scene.restart()
            }, time);
        }

        let shoot = (arr,pos) =>{        
            distance = arr.length > 2 ? distance : 0
            let x1 = arr[pos][0]*step
            let y1 = arr[pos][1]*step
            let x2 = arr[pos+1][0]*step
            let y2 = arr[pos+1][1]*step
            let [length,angle] = pytha(x1,y1,x2,y2)
            length = x1 <= x2 ? length : -length;
            angle = x1 <= x2 && y1 <= y2 ? -angle : angle;
            angle = x1 >= x2 && y1 >= y2 ? -angle : angle;
            let line = this.add.rectangle((width/2)+x1, (height/2)+(y1)*(-1)+distance, 1, 1, 0x0).setOrigin(0, .5).setAngle(angle)
        
            const coords = {x: (width/2)+x1,y: (height/2)+(y1)*(-1)+distance, len:0} 
            const tween = new TWEEN.Tween(coords, false) 
                .to({x: (width/2)+x2, y: (height/2)+(y2)*(-1)+distance, len: length}, length) 
                .easing(TWEEN.Easing.Quadratic.InOut)
                .onUpdate((c) => {
                    line.scaleX = c.len
                    bullet.x = c.x
                    bullet.y = c.y
                    for (const [key, enemy] of Object.entries(enemies)) {
                        if((bullet.x + bullet.scaleX*size >= enemy.x &&
                            bullet.x <= enemy.x + enemy.scaleX*size) && 
                            (bullet.y + bullet.scaleY*size >= enemy.y &&
                            bullet.y <= enemy.y + enemy.scaleY*size)){
                                enemy.destroy()
                                this.scene.pause()
                                restart(1000)
                                console.log("Damn!!!")
                                break;
                        }
                    }
                })
                .onComplete(() => {
                    if((math.abs(line.x)-width/2 > width/2 || math.abs(line.y)-height/2 > height/2) ||
                        (pos+2 >= arr.length)){
                        this.scene.pause()
                        restart(1000)
                        return false
                    }
                    shoot(arr,pos+1)
                })
                .start() // Start the tween immediately.

            // Setup the animation loop.
            function animate(time) {
                tween.update(time)
                requestAnimationFrame(animate)
            }
            requestAnimationFrame(animate)
        }

        form.addEventListener("submit", (e) => {
            e.preventDefault()
            try{
                const val = input.value
                const res = calculate(val,width,height,player_pos[0],enemy_pos[0][0])
                res.unshift([player_pos[0],player_pos[1]])
                console.log(res)
                distance = math.abs(player_pos[1]*step - res[1][1]*step)
                distance = res[1][1] > player_pos[1] ? distance : -distance
                restart_btn.disabled = false
                input.disabled = true
                shoot_btn.disabled = true
                this.tween = this.tweens.add({
                    targets: player,
                    duration: 500,
                    angle:{from:0, to:pytha(player_pos[0],player_pos[1],res[2][0],res[2][1])[1]},
                    ease: 'Power0',
                    onStart: () => {console.log('Rotating!')},
                    onComplete: ()=> {
                        console.log("Shoot!!!")
                        shoot(res,1)
                    }
                });
            }catch(err){
                console.log(err)
            }
        })

        restart_btn.addEventListener("click", () => {
            restart_btn.disabled = true
            input.disabled = false
            shoot_btn.disabled = false
            this.scene.restart()
        })

    }
}

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth - 50,
    height: window.innerHeight - 50,
    backgroundColor: '#c1d0b5',
    scene: Scene,
};

const game = new Phaser.Game(config);