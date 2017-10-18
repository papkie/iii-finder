import {ImageFinder} from "./index"

const imageFinder = new ImageFinder("assets/find.png", "assets/source.png", 15)

async function test() {
    try {
        for (var index = 0; index < 20; index++) {
            console.time('test')
            console.log(await imageFinder.findImage())
            console.timeEnd('test')
        }
    } catch (e) {
        console.error(e)
    }
}

test()