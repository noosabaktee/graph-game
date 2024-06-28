const width = window.innerWidth - 50
const height = window.innerHeight - 50
const size = 10

function calculate(eq,width,height,start,end){
    const dh = math.parse(eq)
    let y = []
    let i=start;
    while(math.abs(i)<width/2){
        const res = dh.evaluate({ x: i })
        y.push([i,res])
        if(start < end){
            i++;
        }else{
            i--;
        }
        if(math.abs(res) > height/2){
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
        const player_pos = [-20,-200]
        const enemy_pos = [450,-100]

        const graphics = this.add.graphics();
        // cartesian
        graphics.lineStyle(2, 0x0, 0.5);
        graphics.moveTo(width/2, 0);
        graphics.lineTo(width/2, height);
        graphics.moveTo(0, height/2);
        graphics.lineTo(width, height/2);
        graphics.strokePath();
        graphics.closePath();

        const player = this.add.rectangle((width/2)+player_pos[0], (height/2)+(player_pos[1])*(-1), size, size, 0x0).setOrigin(.5, .5)
        const enemy = this.add.rectangle((width/2)+enemy_pos[0], (height/2)+(enemy_pos[1])*(-1), size, size, 0x0).setOrigin(.5, .5)
        
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

        let shoot = (x1,y1,x2,y2,arr,pos) =>{
            let [length,angle] = pytha(x1,y1,x2,y2)
            length = x1 <= x2 ? length : -length;
            angle = x1 <= x2 && y1 <= y2 ? -angle : angle;
            angle = x1 >= x2 && y1 >= y2 ? -angle : angle;
            let line = this.add.rectangle((width/2)+x1, (height/2)+(y1)*(-1), 1, 1, 0x0).setOrigin(0, .5).setAngle(angle);
            this.tween = this.tweens.add({
                targets: line,
                duration: length,
                scaleX:{from:0, to:length},
                ease: 'Power0',
                onUpdated: () => {
                    if((line.x + line.scaleX >= enemy.x &&
                        line.x <= enemy.x + enemy.scaleX && 
                        line.y + line.scaleY >= enemy.y &&
                        line.y <= enemy.y + enemy.scaleY)){
                            enemy.destroy()
                            this.scene.pause()
                            restart(1000)
                            console.log("Damn!!!")
                    }
                },
                onComplete: ()=> {
                    if(pos >= arr.length) {
                        restart(1000)
                        return false;
                    }
                    shoot(arr[pos-1][0],arr[pos-1][1],arr[pos][0],arr[pos][1],arr,pos+1)
                }
            });
        }

        form.addEventListener("submit", (e) => {
            e.preventDefault()
            try{
                const val = input.value
                const res = calculate(val,width,height,player_pos[0],enemy_pos[0])
                restart_btn.disabled = false
                input.disabled = true
                shoot_btn.disabled = true
                this.tween = this.tweens.add({
                    targets: player,
                    duration: 1000,
                    angle:{from:0, to:pytha(player_pos[0],player_pos[1],res[0][0],res[0][1])[1]},
                    ease: 'Power0',
                    onStart: () => {console.log('Rotating!')},
                    onComplete: ()=> {
                        console.log("Shoot!!!")
                        shoot(player_pos[0],player_pos[1],res[0][0],res[0][1],res,1)
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
    physics: {
        default: 'arcade',
    }
};

const game = new Phaser.Game(config);